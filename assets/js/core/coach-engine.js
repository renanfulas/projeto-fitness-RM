window.SRM = window.SRM || {};

window.SRM.coachEngine = (function() {
    var entries = window.SRM.entries;
    var formatters = window.SRM.formatters;
    var metrics = window.SRM.metrics;

    function findExerciseGroupInPrompt(prompt, groups) {
        var normalizedPrompt = formatters.slugifyExerciseName(prompt);

        return groups.find(function(group) {
            var normalizedExercise = formatters.slugifyExerciseName(group.exercise);
            return normalizedPrompt.indexOf(normalizedExercise) !== -1;
        }) || null;
    }

    function getSuggestedIncrement(load) {
        if (load < 40) {
            return 1;
        }

        if (load < 80) {
            return 2.5;
        }

        return 5;
    }

    function buildLoadRecommendations(oneRm) {
        return [
            'tecnica 60%: ' + formatters.formatKg(formatters.roundToOne(oneRm * 0.6)),
            'volume 70%: ' + formatters.formatKg(formatters.roundToOne(oneRm * 0.7)),
            'forca 80%: ' + formatters.formatKg(formatters.roundToOne(oneRm * 0.8)),
            'top set 85%: ' + formatters.formatKg(formatters.roundToOne(oneRm * 0.85))
        ].join(', ');
    }

    function getCoachSnapshot(user) {
        if (!user || !user.rms.length) {
            return null;
        }

        var groups = entries.groupEntriesByExercise(user.rms);
        var metricsList = groups.map(function(group) {
            return {
                group: group,
                metrics: metrics.getExerciseMetrics(group.entries)
            };
        });
        var strongest = metricsList.slice().sort(function(a, b) {
            return b.metrics.best.oneRm - a.metrics.best.oneRm;
        })[0];
        var mostImproved = metricsList
            .filter(function(item) {
                return item.metrics.totalEntries > 1;
            })
            .sort(function(a, b) {
                return b.metrics.deltaFromFirst - a.metrics.deltaFromFirst;
            })[0] || null;

        return {
            groups: groups,
            metricsList: metricsList,
            strongest: strongest,
            mostImproved: mostImproved,
            totalEntries: user.rms.length
        };
    }

    function buildExerciseCoachReply(group) {
        var currentMetrics = metrics.getExerciseMetrics(group.entries);
        var increment = getSuggestedIncrement(currentMetrics.latest.load);
        var nextLoad = formatters.roundToOne(currentMetrics.latest.load + increment);
        var latestMode = currentMetrics.latest.entryType === 'estimado' ? 'estimado' : 'direto';

        return group.exercise + ' hoje esta com 1RM ' + latestMode + ' de ' + formatters.formatKg(currentMetrics.latest.oneRm) + '.\n' +
            'Ultimo registro: ' + formatters.formatKg(currentMetrics.latest.load) + ' x ' + currentMetrics.latest.reps + ' reps.\n' +
            'Faixas uteis para o proximo treino: ' + buildLoadRecommendations(currentMetrics.latest.oneRm) + '.\n' +
            'Se a tecnica estiver estavel e o esforco terminar com 1 a 2 repeticoes em reserva, o proximo ajuste pode ser de cerca de +' + formatters.formatKg(increment) + ', chegando perto de ' + formatters.formatKg(nextLoad) + '.\n' +
            'Se a execucao degringolar, mantenha a carga e consolide mais uma sessao antes de subir.';
    }

    function buildWorkoutStructureReply(snapshot) {
        var exercises = snapshot.groups.slice(0, 4).map(function(group) {
            return group.exercise;
        });
        var strongestText = snapshot.strongest
            ? 'Seu melhor numero hoje esta em ' + snapshot.strongest.group.exercise + ' com ' + formatters.formatKg(snapshot.strongest.metrics.best.oneRm) + '.'
            : 'Seu historico ainda esta no inicio.';
        var baseExercises = exercises.length ? exercises.join(', ') : 'agachamento, supino, remada e terra romeno';

        return 'Uma estrutura segura para 3 dias pode ser:\n' +
            'Dia 1: principal de membros inferiores + acessorios leves.\n' +
            'Dia 2: principal de empurrar + puxar horizontal + core.\n' +
            'Dia 3: principal de puxar ou hinge + unilateral + trabalho tecnico.\n' +
            'Com os exercicios que voce ja registrou, eu priorizaria: ' + baseExercises + '.\n' +
            'Regra pratica: 1 movimento principal pesado, 2 complementares moderados e 1 bloco tecnico ou preventivo por sessao.\n' +
            strongestText + '\n' +
            'Evite aumentar carga e volume ao mesmo tempo: suba primeiro a consistencia, depois a tonelagem.';
    }

    function buildSafetyReply(group) {
        var focusText = group
            ? 'No ' + group.exercise + ', sua referencia atual e ' + formatters.formatKg(metrics.getExerciseMetrics(group.entries).latest.oneRm) + '. '
            : '';

        return focusText + 'Para reduzir risco de lesao, use este checklist:\n' +
            '1. aqueça com 3 a 5 series progressivas antes da carga alvo.\n' +
            '2. mantenha 1 a 3 repeticoes em reserva na maior parte da semana.\n' +
            '3. nao aumente mais de uma variavel por vez: ou carga, ou volume, ou frequencia.\n' +
            '4. interrompa a progressao se aparecer dor aguda, perda clara de tecnica ou fadiga fora do normal.\n' +
            '5. em semana ruim de sono ou estresse, reduza 5% a 10% da carga e preserve a execucao.\n' +
            'Se houver dor persistente, irradiada ou limitacao real de movimento, a orientacao deixa de ser de treino e passa a exigir avaliacao profissional.';
    }

    function buildProgressReply(snapshot, group) {
        if (group) {
            var currentMetrics = metrics.getExerciseMetrics(group.entries);

            if (currentMetrics.totalEntries === 1) {
                return 'Voce ainda tem apenas um ponto em ' + group.exercise + '. Registre pelo menos mais 2 sessoes para decidir se vale subir carga, reps ou volume total.';
            }

            return group.exercise + ' saiu de ' + formatters.formatKg(currentMetrics.first.oneRm) + ' para ' + formatters.formatKg(currentMetrics.latest.oneRm) + '.\n' +
                'Delta total: ' + (currentMetrics.deltaFromFirst >= 0 ? '+' : '-') + formatters.formatKg(Math.abs(currentMetrics.deltaFromFirst)) + ' em ' + currentMetrics.daysFromFirst + ' dias.\n' +
                'Minha leitura: mantenha a progressao se a tecnica seguir limpa; se a ultima sessao foi muito sofrida, repita a carga e tente ganhar 1 repeticao antes de subir peso.';
        }

        if (snapshot.mostImproved) {
            return 'Seu maior salto foi em ' + snapshot.mostImproved.group.exercise + ', com +' + formatters.formatKg(snapshot.mostImproved.metrics.deltaFromFirst) + ' desde o primeiro registro.\n' +
                'Use esse exercicio como referencia de estrategia: aquecimento consistente, boa tecnica e progressao menor, mas mais frequente.';
        }

        return 'Seu historico ainda esta curto para ler tendencia. Registre o mesmo exercicio em pelo menos 3 datas para eu conseguir orientar melhor a progressao.';
    }

    function buildRecoveryReply(snapshot) {
        var strongestLine = snapshot && snapshot.strongest
            ? 'Como seu pico atual esta em ' + snapshot.strongest.group.exercise + ', vale proteger esse padrao nos dias de fadiga alta.\n'
            : '';

        return strongestLine + 'Sinais de que vale fazer um ajuste de recuperacao ou deload:\n' +
            '- queda de performance por 2 ou 3 sessoes seguidas\n' +
            '- perda tecnica antes do esperado\n' +
            '- dores que nao somem entre treinos\n' +
            '- sono ruim e sensacao de peso anormal no aquecimento\n' +
            'Nessa situacao, reduza 30% a 40% do volume por 4 a 7 dias e mantenha cargas entre 60% e 75% do 1RM para recuperar sem desligar do treino.';
    }

    function buildDefaultCoachReply(snapshot) {
        if (!snapshot) {
            return 'Ainda nao ha registros suficientes para uma leitura personalizada. Comece com 3 a 4 exercicios base, registre carga e repeticoes por 1 ou 2 semanas e eu consigo sugerir progressao, distribuicao de treino e ajustes de seguranca.';
        }

        var strongest = snapshot.strongest
            ? snapshot.strongest.group.exercise + ' com ' + formatters.formatKg(snapshot.strongest.metrics.best.oneRm)
            : 'nenhum PR consolidado ainda';
        var improvement = snapshot.mostImproved
            ? snapshot.mostImproved.group.exercise + ' foi o exercicio que mais evoluiu'
            : 'ainda faltam repeticoes de historico para medir tendencia';

        return 'Resumo rapido do seu painel:\n' +
            '- exercicios acompanhados: ' + snapshot.groups.length + '\n' +
            '- registros totais: ' + snapshot.totalEntries + '\n' +
            '- maior marca atual: ' + strongest + '\n' +
            '- leitura de evolucao: ' + improvement + '.\n' +
            'Se quiser, posso montar um treino, sugerir cargas por exercicio ou revisar sinais de seguranca para sua proxima semana.';
    }

    function generateCoachReply(user, prompt) {
        var snapshot = getCoachSnapshot(user);
        var groups = snapshot ? snapshot.groups : [];
        var mentionedGroup = findExerciseGroupInPrompt(prompt, groups);
        var wantsWorkout = /(treino|montar|estrutura|divisao|periodiz|planej)/i.test(prompt);
        var wantsLoad = /(carga|kg|peso|1rm|porcent|quanto usar|quanto colocar)/i.test(prompt);
        var wantsSafety = /(machucar|lesa|seguran|dor|aquec|tecnica|postura|proteger)/i.test(prompt);
        var wantsProgress = /(progres|evolu|melhor|subir|aument|proximo treino|pr)/i.test(prompt);
        var wantsRecovery = /(deload|fadiga|cansad|recuper|descanso|exaust)/i.test(prompt);

        if (!snapshot) {
            if (wantsWorkout) {
                return 'Sem historico salvo ainda, eu montaria um inicio conservador com 3 dias:\nDia 1 empurrar + quadriceps\nDia 2 puxar + posterior\nDia 3 full body leve\nUse cargas que deixem 2 repeticoes em reserva e registre tudo por uma semana para eu refinar com base real.';
            }

            return buildDefaultCoachReply(snapshot);
        }

        if (wantsSafety) {
            return buildSafetyReply(mentionedGroup);
        }

        if (wantsWorkout) {
            return buildWorkoutStructureReply(snapshot);
        }

        if (wantsRecovery) {
            return buildRecoveryReply(snapshot);
        }

        if (wantsLoad && mentionedGroup) {
            return buildExerciseCoachReply(mentionedGroup);
        }

        if (wantsLoad && snapshot.strongest) {
            return buildExerciseCoachReply(snapshot.strongest.group) + '\n\nSe quiser algo mais preciso, me diga o exercicio pelo nome.';
        }

        if (wantsProgress) {
            return buildProgressReply(snapshot, mentionedGroup);
        }

        if (mentionedGroup) {
            return buildExerciseCoachReply(mentionedGroup);
        }

        return buildDefaultCoachReply(snapshot);
    }

    return {
        getCoachSnapshot: getCoachSnapshot,
        generateCoachReply: generateCoachReply
    };
})();
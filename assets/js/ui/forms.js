window.SRM = window.SRM || {};

window.SRM.uiForms = (function() {
    var entries = window.SRM.entries;
    var formatters = window.SRM.formatters;

    function setFormFeedback(dom, state, message, type) {
        dom.formFeedback.className = 'form-feedback';
        dom.formFeedback.textContent = '';

        if (state.feedbackTimeoutId) {
            clearTimeout(state.feedbackTimeoutId);
            state.feedbackTimeoutId = null;
        }

        if (!message) {
            return;
        }

        dom.formFeedback.textContent = message;
        dom.formFeedback.classList.add('is-visible');
        dom.formFeedback.classList.add(type === 'error' ? 'is-error' : type === 'success' ? 'is-success' : 'is-info');

        if (type !== 'error') {
            state.feedbackTimeoutId = setTimeout(function() {
                dom.formFeedback.className = 'form-feedback';
                dom.formFeedback.textContent = '';
            }, 4000);
        }
    }

    function updateEntryPreview(dom) {
        var load = Number(dom.rmValueField.value);
        var reps = Math.max(1, Number(dom.repsValueField.value) || 1);

        if (!load || load < 1) {
            dom.entryPreview.textContent = 'Preencha carga e repeticoes para visualizar o 1RM estimado.';
            return;
        }

        var oneRm = entries.estimateOneRm(load, reps);
        var modeLabel = reps > 1 ? 'estimado' : 'direto';

        dom.entryPreview.textContent = '1RM ' + modeLabel + ': ' + formatters.formatKg(oneRm) + ' com ' + formatters.formatKg(load) + ' x ' + reps + ' reps.';
    }

    function resetEntryForm(dom, state, options) {
        state.editingEntryId = null;
        dom.entryForm.reset();
        dom.repsValueField.value = '1';
        dom.formModeLabel.textContent = 'Modo rapido';
        dom.saveRmButton.textContent = 'Salvar registro';
        dom.cancelEditButton.classList.add('hidden');
        updateEntryPreview(dom);

        if (!options || !options.keepFeedback) {
            setFormFeedback(dom, state, '', 'info');
        }
    }

    function startEditingEntry(dom, state, user, entryId) {
        var entry = entries.getEntryById(user, entryId);

        if (!entry) {
            setFormFeedback(dom, state, 'Nao foi possivel localizar o registro para edicao.', 'error');
            return;
        }

        state.editingEntryId = entry.id;
        dom.exerciseNameField.value = entry.exercise;
        dom.rmValueField.value = entry.load;
        dom.repsValueField.value = entry.reps;
        dom.formModeLabel.textContent = 'Editando registro de ' + entry.exercise;
        dom.saveRmButton.textContent = 'Atualizar registro';
        dom.cancelEditButton.classList.remove('hidden');
        updateEntryPreview(dom);
        setFormFeedback(dom, state, 'Modo de edicao ativado. Atualize os campos e salve para aplicar a mudanca.', 'info');
        dom.addCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
        dom.exerciseNameField.focus();
    }

    function validateEntryForm(dom, state) {
        var exerciseName = formatters.titleCaseExercise(dom.exerciseNameField.value);
        var load = Number(dom.rmValueField.value);
        var reps = Number(dom.repsValueField.value);
        var nameRegex = /^[A-Za-zÀ-ÿ0-9\s()./-]+$/;

        if (!nameRegex.test(exerciseName) || exerciseName.length < 2) {
            setFormFeedback(dom, state, 'Use um nome valido para o exercicio.', 'error');
            dom.exerciseNameField.focus();
            return null;
        }

        if (!load || load < 1 || load > 999) {
            setFormFeedback(dom, state, 'A carga deve estar entre 1 kg e 999 kg.', 'error');
            dom.rmValueField.focus();
            return null;
        }

        if (!reps || reps < 1 || reps > 15) {
            setFormFeedback(dom, state, 'As repeticoes devem estar entre 1 e 15.', 'error');
            dom.repsValueField.focus();
            return null;
        }

        return {
            exercise: exerciseName,
            load: formatters.roundToOne(load),
            reps: reps,
            oneRm: entries.estimateOneRm(load, reps),
            entryType: reps > 1 ? 'estimado' : 'direto'
        };
    }

    return {
        setFormFeedback: setFormFeedback,
        updateEntryPreview: updateEntryPreview,
        resetEntryForm: resetEntryForm,
        startEditingEntry: startEditingEntry,
        validateEntryForm: validateEntryForm
    };
})();
window.SRM = window.SRM || {};

window.SRM.metrics = (function() {
    var formatters = window.SRM.formatters;

    function getExerciseMetrics(entries) {
        var orderedEntries = entries.slice().sort(function(a, b) {
            return new Date(a.createdAt) - new Date(b.createdAt);
        });
        var first = orderedEntries[0];
        var latest = orderedEntries[orderedEntries.length - 1];
        var previous = orderedEntries.length > 1 ? orderedEntries[orderedEntries.length - 2] : null;
        var best = orderedEntries.reduce(function(currentBest, entry) {
            return entry.oneRm > currentBest.oneRm ? entry : currentBest;
        }, orderedEntries[0]);
        var deltaFromFirst = formatters.roundToOne(latest.oneRm - first.oneRm);
        var deltaFromPrevious = previous ? formatters.roundToOne(latest.oneRm - previous.oneRm) : 0;
        var daysFromFirst = orderedEntries.length > 1 ? formatters.daysBetween(first.createdAt, latest.createdAt) : 0;
        var daysFromPrevious = previous ? formatters.daysBetween(previous.createdAt, latest.createdAt) : 0;
        var latestIsPr = latest.id === best.id;

        return {
            first: first,
            latest: latest,
            previous: previous,
            best: best,
            deltaFromFirst: deltaFromFirst,
            deltaFromPrevious: deltaFromPrevious,
            daysFromFirst: daysFromFirst,
            daysFromPrevious: daysFromPrevious,
            latestIsPr: latestIsPr,
            totalEntries: orderedEntries.length
        };
    }

    function buildProgressMessage(exercise, metrics) {
        if (metrics.totalEntries === 1) {
            return 'Primeiro registro salvo. Agora voce tem um ponto de partida claro para evoluir.';
        }

        if (metrics.deltaFromFirst > 0) {
            return exercise + ' subiu ' + formatters.formatKg(metrics.deltaFromFirst) + ' em ' + metrics.daysFromFirst + ' dias.';
        }

        if (metrics.deltaFromFirst < 0) {
            return exercise + ' oscilou ' + formatters.formatKg(Math.abs(metrics.deltaFromFirst)) + ' em ' + metrics.daysFromFirst + ' dias.';
        }

        return exercise + ' manteve o mesmo nivel entre o primeiro e o ultimo registro.';
    }

    function buildLatestComparison(metrics) {
        if (!metrics.previous) {
            return 'Sem comparacao anterior por enquanto.';
        }

        if (metrics.deltaFromPrevious > 0) {
            return 'Ultimo teste: +' + formatters.formatKg(metrics.deltaFromPrevious) + ' em ' + metrics.daysFromPrevious + ' dias.';
        }

        if (metrics.deltaFromPrevious < 0) {
            return 'Ultimo teste: -' + formatters.formatKg(Math.abs(metrics.deltaFromPrevious)) + ' em ' + metrics.daysFromPrevious + ' dias.';
        }

        return 'Ultimo teste manteve a mesma marca do registro anterior.';
    }

    return {
        getExerciseMetrics: getExerciseMetrics,
        buildProgressMessage: buildProgressMessage,
        buildLatestComparison: buildLatestComparison
    };
})();
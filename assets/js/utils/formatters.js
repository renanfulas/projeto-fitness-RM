window.SRM = window.SRM || {};

window.SRM.formatters = (function() {
    function roundToOne(value) {
        return Math.round(Number(value) * 10) / 10;
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function formatKg(value) {
        var numericValue = Number(value) || 0;
        var hasDecimal = Math.abs(numericValue % 1) > 0;

        return numericValue.toLocaleString('pt-BR', {
            minimumFractionDigits: hasDecimal ? 1 : 0,
            maximumFractionDigits: 1
        }) + ' kg';
    }

    function formatDate(dateValue) {
        return new Date(dateValue).toLocaleDateString('pt-BR');
    }

    function formatTime(dateValue) {
        return new Date(dateValue).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function formatCoachTime(dateValue) {
        return new Date(dateValue).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function daysBetween(startDate, endDate) {
        var start = new Date(startDate);
        var end = new Date(endDate);
        var diff = Math.abs(end - start);

        return Math.max(1, Math.round(diff / 86400000));
    }

    function slugifyExerciseName(name) {
        return String(name || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .trim()
            .toLowerCase();
    }

    function titleCaseExercise(name) {
        return String(name || '')
            .trim()
            .replace(/\s+/g, ' ')
            .replace(/\b\w/g, function(letter) {
                return letter.toUpperCase();
            });
    }

    return {
        roundToOne: roundToOne,
        escapeHtml: escapeHtml,
        formatKg: formatKg,
        formatDate: formatDate,
        formatTime: formatTime,
        formatCoachTime: formatCoachTime,
        daysBetween: daysBetween,
        slugifyExerciseName: slugifyExerciseName,
        titleCaseExercise: titleCaseExercise
    };
})();
window.SRM = window.SRM || {};

window.SRM.entries = (function() {
    var storage = window.SRM.storage;
    var formatters = window.SRM.formatters;

    function estimateOneRm(load, reps) {
        if (reps <= 1) {
            return formatters.roundToOne(load);
        }

        return formatters.roundToOne(load * (1 + reps / 30));
    }

    function parseLegacyCreatedAt(entry) {
        if (entry.createdAt) {
            return entry.createdAt;
        }

        if (entry.date) {
            var dateParts = String(entry.date).split('/');
            var timeParts = String(entry.time || '00:00').split(':');

            if (dateParts.length === 3) {
                var day = Number(dateParts[0]);
                var month = Number(dateParts[1]) - 1;
                var year = Number(dateParts[2]);
                var hours = Number(timeParts[0] || 0);
                var minutes = Number(timeParts[1] || 0);

                return new Date(year, month, day, hours, minutes).toISOString();
            }
        }

        return new Date().toISOString();
    }

    function migrateUser(user) {
        if (!user) {
            return user;
        }

        if (!Array.isArray(user.rms)) {
            user.rms = [];
        }

        user.rms = user.rms
            .map(function(entry, index) {
                var exercise = formatters.titleCaseExercise(entry.exercise || '');
                var load = Number(entry.load || entry.value || 0);
                var reps = Math.max(1, Number(entry.reps || 1));
                var createdAt = parseLegacyCreatedAt(entry);
                var oneRm = Number(entry.oneRm) || estimateOneRm(load, reps);
                var entryType = entry.entryType || (reps > 1 ? 'estimado' : 'direto');

                return {
                    id: entry.id || 'entry-' + new Date(createdAt).getTime() + '-' + index,
                    exercise: exercise,
                    load: formatters.roundToOne(load),
                    reps: reps,
                    oneRm: formatters.roundToOne(oneRm),
                    entryType: entryType,
                    createdAt: createdAt
                };
            })
            .filter(function(entry) {
                return entry.exercise && entry.load > 0;
            });

        return user;
    }

    function getCurrentUserData() {
        var loggedInUser = storage.getLoggedInUsername();
        var users = storage.getUsers();
        var user = users.find(function(item) {
            return item.username === loggedInUser;
        });

        if (!user) {
            return null;
        }

        return migrateUser(user);
    }

    function persistCurrentUser(user) {
        var users = storage.getUsers();
        var userIndex = users.findIndex(function(item) {
            return item.username === user.username;
        });

        if (userIndex >= 0) {
            users[userIndex] = user;
            storage.saveUsers(users);
        }
    }

    function getEntryById(user, entryId) {
        if (!user || !Array.isArray(user.rms)) {
            return null;
        }

        return user.rms.find(function(entry) {
            return entry.id === entryId;
        }) || null;
    }

    function groupEntriesByExercise(entries) {
        var groups = {};

        entries.forEach(function(entry) {
            var key = formatters.slugifyExerciseName(entry.exercise);

            if (!groups[key]) {
                groups[key] = {
                    key: key,
                    exercise: entry.exercise,
                    entries: []
                };
            }

            groups[key].entries.push(entry);
        });

        return Object.values(groups)
            .map(function(group) {
                group.entries.sort(function(a, b) {
                    return new Date(a.createdAt) - new Date(b.createdAt);
                });
                return group;
            })
            .sort(function(a, b) {
                var aDate = new Date(a.entries[a.entries.length - 1].createdAt);
                var bDate = new Date(b.entries[b.entries.length - 1].createdAt);
                return bDate - aDate;
            });
    }

    return {
        estimateOneRm: estimateOneRm,
        parseLegacyCreatedAt: parseLegacyCreatedAt,
        migrateUser: migrateUser,
        getCurrentUserData: getCurrentUserData,
        persistCurrentUser: persistCurrentUser,
        getEntryById: getEntryById,
        groupEntriesByExercise: groupEntriesByExercise
    };
})();
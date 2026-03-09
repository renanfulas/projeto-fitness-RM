window.SRM = window.SRM || {};

window.SRM.storage = (function() {
    function getUsers() {
        return JSON.parse(localStorage.getItem('users')) || [];
    }

    function saveUsers(users) {
        localStorage.setItem('users', JSON.stringify(users));
    }

    function getLoggedInUsername() {
        return sessionStorage.getItem('loggedInUser');
    }

    function setLoggedInUsername(username) {
        sessionStorage.setItem('loggedInUser', username);
    }

    function clearLoggedInUsername() {
        sessionStorage.removeItem('loggedInUser');
    }

    function getCoachStorageKey(username) {
        var activeUsername = username || getLoggedInUsername();
        return activeUsername ? 'coach-chat:' + activeUsername : 'coach-chat';
    }

    function loadCoachConversation(username) {
        try {
            return JSON.parse(localStorage.getItem(getCoachStorageKey(username))) || [];
        } catch (error) {
            return [];
        }
    }

    function persistCoachConversation(conversation, username) {
        localStorage.setItem(getCoachStorageKey(username), JSON.stringify((conversation || []).slice(-18)));
    }

    return {
        getUsers: getUsers,
        saveUsers: saveUsers,
        getLoggedInUsername: getLoggedInUsername,
        setLoggedInUsername: setLoggedInUsername,
        clearLoggedInUsername: clearLoggedInUsername,
        getCoachStorageKey: getCoachStorageKey,
        loadCoachConversation: loadCoachConversation,
        persistCoachConversation: persistCoachConversation
    };
})();
document.addEventListener('DOMContentLoaded', () => {
    const showRegisterLink = document.getElementById('show-register');
    const showLoginLink = document.getElementById('show-login');
    const loginPage = document.getElementById('login-page');
    const registerPage = document.getElementById('register-page');
    const appPage = document.getElementById('app-page');
    const registerButton = document.getElementById('register-button');
    const loginButton = document.getElementById('login-button');
    const logoutButton = document.getElementById('logout-button');
    const saveRmButton = document.getElementById('save-rm-button');
    const rmList = document.getElementById('rm-list');

    // Navegação entre páginas
    showRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginPage.classList.remove('active');
        registerPage.classList.add('active');
    });

    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        registerPage.classList.remove('active');
        loginPage.classList.add('active');
    });

    // Lógica de Cadastro
    registerButton.addEventListener('click', () => {
        const username = document.getElementById('register-username').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;

        // Validação de Senha Forte
        // Mínimo 8 chars, 1 maiúscula (A-Z), 1 especial, 1 número
        const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}$/;

        if (!passwordRegex.test(password)) {
            alert('A senha deve ter no mínimo 8 caracteres, contendo pelo menos uma letra maiúscula, um número e um caractere especial.');
            return;
        }

        if (username && password && email) {
            const users = JSON.parse(localStorage.getItem('users')) || [];
            
            // Verifica se usuário ou email já existem
            if (users.find(user => user.username === username || user.email === email)) {
                alert('Usuário ou E-mail já cadastrado!');
            } else {
                users.push({ username, email, password, rms: [] });
                localStorage.setItem('users', JSON.stringify(users));
                alert('Cadastro realizado com sucesso!');
                showLoginLink.click();
            }
        } else {
            alert('Por favor, preencha todos os campos.');
        }
    });

    // Lógica de Login
    loginButton.addEventListener('click', () => {
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        const users = JSON.parse(localStorage.getItem('users')) || [];
        
        // Permite login por Username OU Email
        const user = users.find(u => (u.username === username || u.email === username) && u.password === password);

        if (user) {
            // Salva o username real na sessão para consistência
            sessionStorage.setItem('loggedInUser', user.username);
            loginPage.classList.remove('active');
            appPage.classList.add('active');
            loadUserRms();
        } else {
            alert('Usuário ou senha inválidos.');
        }
    });

    // Lógica de Logout
    logoutButton.addEventListener('click', () => {
        sessionStorage.removeItem('loggedInUser');
        appPage.classList.remove('active');
        loginPage.classList.add('active');
        rmList.innerHTML = ''; // Limpa a lista de RMs
    });

    // Carregar RMs do usuário
    function loadUserRms() {
        const loggedInUser = sessionStorage.getItem('loggedInUser');
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.username === loggedInUser);

        rmList.innerHTML = ''; // Limpa a lista antes de carregar
        if (user && user.rms) {
            user.rms.forEach(rm => {
                displayRm(rm.exercise, rm.value);
            });
        }
    }

    // Salvar novo RM
    saveRmButton.addEventListener('click', () => {
        const exerciseName = document.getElementById('exercise-name').value;
        const rmValue = document.getElementById('rm-value').value;
        const loggedInUser = sessionStorage.getItem('loggedInUser');

        if (exerciseName && rmValue && loggedInUser) {
            let users = JSON.parse(localStorage.getItem('users')) || [];
            let user = users.find(u => u.username === loggedInUser);

            if (user) {
                user.rms.push({ exercise: exerciseName, value: rmValue });
                localStorage.setItem('users', JSON.stringify(users));
                displayRm(exerciseName, rmValue);
                document.getElementById('exercise-name').value = '';
                document.getElementById('rm-value').value = '';
            }
        } else {
            alert('Por favor, preencha o nome do exercício e o valor do RM.');
        }
    });

    // Exibir um RM na lista
    function displayRm(exercise, rm) {
        const item = document.createElement('div');
        item.classList.add('rm-item');

        let percentagesOptions = '';
        for (let i = 50; i <= 100; i += 5) {
            percentagesOptions += `<option value="${i}">${i}%</option>`;
        }

        item.innerHTML = `
            <h4>${exercise}: ${rm}kg</h4>
            <div class="percentage-calculator">
                <select>
                    ${percentagesOptions}
                </select>
                <span class="calculated-weight"></span>
            </div>
        `;

        const select = item.querySelector('select');
        const weightSpan = item.querySelector('.calculated-weight');

        select.addEventListener('change', (e) => {
            const percentage = e.target.value;
            const calculated = (rm * (percentage / 100)).toFixed(2);
            weightSpan.textContent = `= ${calculated}kg`;
        });

        rmList.appendChild(item);
    }

    // Verifica se o usuário já está logado ao carregar a página
    if (sessionStorage.getItem('loggedInUser')) {
        loginPage.classList.remove('active');
        appPage.classList.add('active');
        loadUserRms();
    }
});

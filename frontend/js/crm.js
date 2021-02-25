(() => {
    // Константы 
    const tbody = document.querySelector('.table tbody'),
          theads = document.querySelectorAll('.table thead tr th'),
          inputSearch = document.querySelector('#search'),
          btnDelete = document.querySelector('#btn-delete'),
          contactForms = document.querySelector('#contact-forms'),
          surnamePlaceholder = document.querySelectorAll('.surname-placeholder'),
          namePlaceholder = document.querySelectorAll('.name-placeholder'),
          middleNamePlaceholder = document.querySelectorAll('.middle-name-placeholder'),
          inputSurname = document.querySelectorAll('#surname'),
          inputName = document.querySelectorAll('#name'),
          inputMiddleName = document.querySelectorAll('#middle-name'),
          btnAddContactForm = document.querySelectorAll('#btn-add-contact-form'),
          btnSave = document.querySelector('#btn-save'),
          changeModalHeader = document.querySelector('#modalChangeContact .modal-header');

    // Создание строки
    function createContact(data) {
        // Форматируем дату создания
        let minCreate = new Date(data.createdAt).getMinutes(),
            hoursCreate = new Date(data.createdAt).getHours(),
            ddCreate = new Date(data.createdAt).getDate(),
            mmCreate = new Date(data.createdAt).getMonth() + 1,
            yyyyCreate = new Date(data.createdAt).getFullYear();

        if (ddCreate < 10) ddCreate = '0' + ddCreate;
        if (mmCreate < 10) mmCreate = '0' + mmCreate;
        if (hoursCreate < 10) hoursCreate = '0' + hoursCreate;
        if (minCreate < 10) minCreate = '0' + minCreate;

        // Форматируем дату редактирования
        let minChange = new Date(data.updatedAt).getMinutes(),
            hoursChange = new Date(data.updatedAt).getHours(),
            ddChange = new Date(data.updatedAt).getDate(),
            mmChange = new Date(data.updatedAt).getMonth() + 1,
            yyyyChange = new Date(data.updatedAt).getFullYear();

        if (ddChange < 10) ddChange = '0' + ddChange;
        if (mmChange < 10) mmChange = '0' + mmChange;
        if (hoursChange < 10) hoursChange = '0' + hoursChange;
        if (minChange < 10) minChange = '0' + minChange;

        
        // Формируем контакты
        let contacts = [];

        data.contacts.forEach(i => {
            if (i.type === 'Телефон') {
                contacts.push(`
                <a data-tooltip="Телефон: <span style='font-weight: 700'>${i.value}</span>">
                    <img src="img/phone.svg">
                </a>
                `);
            }
            if (i.type === 'Email') {
                contacts.push(`
                <a data-tooltip="Email: <span style='font-weight: 700'>${i.value}</span>">
                    <img src="img/email.svg">
                </a>
                `);
            }
            if (i.type === 'VK') {
                contacts.push(`
                <a data-tooltip="VK: <span style='font-weight: 700'>${i.value}</span>">
                    <img src="img/vk.svg">
                </a>
                `);
            }
            if (i.type === 'Facebook') {
                contacts.push(`
                <a data-tooltip="Facebook: <span style='font-weight: 700'>${i.value}</span>">
                    <img src="img/facebook.svg">
                </a>
                `);
            }
            if (i.type === 'Другое') {
                contacts.push(`
                <a data-tooltip="<span style='font-weight: 700'>${i.value}</span>">
                    <img src="img/other.svg">
                </a>
                `);
            }
        });
        
        const tr = document.createElement('tr'),
              td = document.createElement('td'),
              aChange = document.createElement('a'),
              aDelete = document.createElement('a');
        
        tr.innerHTML = `
            <td class="table__id">${data.id}</td>
            <td>${data.surname.substr(0, 1).toUpperCase() + data.surname.substr(1).toLowerCase()} ${data.name.substr(0, 1).toUpperCase() + data.name.substr(1).toLowerCase()} ${data.lastName.substr(0, 1).toUpperCase() + data.lastName.substr(1).toLowerCase()}</td>
            <td>${ddCreate}.${mmCreate}.${yyyyCreate} <span class="grey">${hoursCreate}:${minCreate}</span></td>
            <td>${ddChange}.${mmChange}.${yyyyChange} <span class="grey">${hoursChange}:${minChange}</span></td>
            <td class="contacts">${contacts.join('')}</td>
        `;

        aChange.setAttribute('id', 'change');
        aChange.setAttribute('data-bs-toggle', 'modal');
        aChange.setAttribute('data-bs-target', '#modalChangeContact');
        aChange.setAttribute('data-id', data.id);
        aChange.innerHTML = `
            <img src="img/change.svg">
            Изменить
        `;
        aChange.addEventListener('click', () => {
            changeModalHeader.prepend(createChangeModalTitle(aChange.getAttribute('data-id')));
            changeClient(aChange.getAttribute('data-id'));
        });

        aDelete.setAttribute('id', 'delete');
        aDelete.setAttribute('data-bs-toggle', 'modal');
        aDelete.setAttribute('data-bs-target', '#modalDeleteContact');
        aDelete.setAttribute('data-id', data.id);
        aDelete.innerHTML = `
            <img src="img/delete.svg">
            Удалить
        `;
        td.append(aChange);
        td.append(aDelete);
        tr.append(td);

        aDelete.addEventListener('click', () => {
            deleteContact(aDelete.getAttribute('data-id'));
        });

        return tr;
    }

    // Tooltips
    let tooltipElem;

    document.onmouseover = function(event) {
        let target = event.target;

        // если у нас есть подсказка...
        let tooltipHtml = target.dataset.tooltip;
        if (!tooltipHtml) return;

        // ...создадим элемент для подсказки
        tooltipElem = document.createElement('div');
        tooltipElem.className = 'tooltip-test';
        tooltipElem.innerHTML = tooltipHtml;
        document.body.append(tooltipElem);

        // спозиционируем его сверху от аннотируемого элемента (top-center)
        let coords = target.getBoundingClientRect();

        let left = coords.left + (target.offsetWidth - tooltipElem.offsetWidth) / 2;
        if (left < 0) left = 0; // не заезжать за левый край окна

        let top = coords.top - tooltipElem.offsetHeight - 5;
        if (top < 0) { // если подсказка не помещается сверху, то отображать её снизу
            top = coords.top + target.offsetHeight + 5;
        }

        tooltipElem.style.left = left + 'px';
        tooltipElem.style.top = top + 'px';
    };

    document.onmouseout = function() {
        if (tooltipElem) {
            tooltipElem.remove();
            tooltipElem = null;
        }
    };

    // Поиск
    let delay;

    function delaySearch() {
        clearTimeout(delay);
        delay = setTimeout(search, 300);
    }

    function search() {
        tbody.innerHTML = '';
        appContacts(`http://localhost:3000/api/clients?search=${inputSearch.value}`);
    }

    inputSearch.addEventListener('input', delaySearch);
    
    // Сортировка по заголовкам таблицы
    function sort(arr) {
        function clearCols() {
            tbody.innerHTML = '';
            for (let i = 0; i <= 3; ++i) {
                theads[i].classList.remove('active');
            }
        }
        
        // Сортировка по ID
        theads[0].innerHTML = 'ID <span class="purple">↑</span>';

        function sortID(arg1, arg2, arrow) {
            displayTable(arr.sort((a, b) => {
                if (a.id < b.id) return arg1;
                if (a.id > b.id) return arg2;
                return 0;
            }));
            theads[0].classList.add('active');
            theads[0].innerHTML = `ID <span class="purple">${arrow}</span>`;
        }
        
        let countClick1 = 1;
        theads[0].addEventListener('click', () => {
            clearCols();
            if (countClick1 === 0) {
                countClick1 = 1;
                sortID(-1, 1, '↑');
            } else if (countClick1 === 1) {
                countClick1 = 0;
                sortID(1, -1, '↓');
            }
        });
        
        // Сортировка по ФИО
        function sortFIO(arg1, arg2, arrow) {
            displayTable(arr.sort((a, b) => {
                if (a.surname + a.name + a.middleName < b.surname + b.name + b.middleName) return arg1;
                if (a.surname + a.name + a.middleName > b.surname + b.name + b.middleName) return arg2;
                return 0;
            }));
            theads[1].classList.add('active');
            theads[1].innerHTML = `Фамилия Имя Отчество <span class="purple">${arrow}</span>`;
        }

        let countClick2 = 0;
        theads[1].addEventListener('click', () => {
            clearCols();
            if (countClick2 === 0) {
                countClick2 = 1;
                sortFIO(-1, 1, '↑ А-Я');
            } else if (countClick2 === 1) {
                countClick2 = 0;
                sortFIO(1, -1, '↓ Я-А');
            }
        });

        // Сортировка по дате создания
        function sortCreateDate(arg1, arg2, arrow) {
            displayTable(arr.sort((a, b) => {
                if (a.createdAt < b.createdAt) return arg1;
                if (a.createdAt > b.createdAt) return arg2;
                return 0;
            }));
            theads[2].classList.add('active');
            theads[2].innerHTML = `Дата и время создания <span class="purple">${arrow}</span>`;
        }

        let countClick3 = 0;
        theads[2].addEventListener('click', () => {
            clearCols();
            if (countClick3 === 0) {
                countClick3 = 1;
                sortCreateDate(-1, 1, '↑');
            } else if (countClick3 === 1) {
                countClick3 = 0;
                sortCreateDate(1, -1, '↓');
            }
        });

        // Сортировка по дате изменения
        function sortChangeDate(arg1, arg2, arrow) {
            displayTable(arr.sort((a, b) => {
                if (a.updatedAt < b.updatedAt) return arg1;
                if (a.updatedAt > b.updatedAt) return arg2;
                return 0;
            }));
            theads[3].classList.add('active');
            theads[3].innerHTML = `Последние изменения <span class="purple">${arrow}</span>`;
        }

        let countClick4 = 0;
        theads[3].addEventListener('click', () => {
            clearCols();
            if (countClick4 === 0) {
                countClick4 = 1;
                sortChangeDate(-1, 1, '↑');
            } else if (countClick4 === 1) {
                countClick4 = 0;
                sortChangeDate(1, -1, '↓');
            }
        });
    }

    // Удаление контакта
    function deleteContact(id) {
        btnDelete.addEventListener('click', () => {
            fetch(`http://localhost:3000/api/clients/${id}`, {
                method: 'DELETE'
            });
        });
    }

    // Создаем форму для добавления контакта
    let countForms = 0;

    function createAddContactForm(value = '') {
        const inputGroup = document.createElement('div'),
              select = document.createElement('select'),
              optionTel = document.createElement('option'),
              optionEmail = document.createElement('option'),
              optionFacebook = document.createElement('option'),
              optionVK = document.createElement('option'),
              optionOther = document.createElement('option'),
              input = document.createElement('input'),
              btnDeleteContact = document.createElement('button');

        inputGroup.classList.add('input-group', 'mb-3');
        select.classList.add('form-select');
        optionTel.setAttribute('selected', '');
        optionTel.setAttribute('value', 'Телефон');
        optionTel.textContent = 'Телефон';
        optionEmail.setAttribute('value', 'Email');
        optionEmail.textContent = 'Email';
        optionFacebook.setAttribute('value', 'Facebook');
        optionFacebook.textContent = 'Facebook';
        optionVK.setAttribute('value', 'VK');
        optionVK.textContent = 'VK';
        optionOther.setAttribute('value', 'Другое');
        optionOther.textContent = 'Другое';
        input.classList.add('form-control');
        input.setAttribute('type', 'text');
        input.setAttribute('placeholder', 'Введите данные контакта');
        input.value = value;
        btnDeleteContact.classList.add('btn', 'btn-group-delete');
        btnDeleteContact.setAttribute('type', 'button');
        btnDeleteContact.setAttribute('data-tooltip', `<span style='font-weight: 700;'>Удалить контакт</span>`);
        btnDeleteContact.innerHTML = `
            <img src="img/cross.svg">
        `;
        btnDeleteContact.addEventListener('mouseover', () => {
            btnDeleteContact.innerHTML = `
                <img src="img/delete.svg">
            `;
        });
        btnDeleteContact.addEventListener('mouseout', () => {
            btnDeleteContact.innerHTML = `
                <img src="img/cross.svg">
            `;
        });

        select.append(optionTel, optionEmail, optionFacebook, optionVK, optionOther);
        inputGroup.append(select, input, btnDeleteContact);

        btnDeleteContact.addEventListener('click', () => {
            inputGroup.remove();
            --countForms;
            if (countForms < 10) {
                btnAddContactForm.style.display = 'inline-block';
            }
        });

        return inputGroup;
    }

    // Наведение на кнопку Добавить конакт
    function hoverAddContact () {
        btnAddContactForm.forEach(i => {
            i.addEventListener('mouseover', () => {
                i.innerHTML = `
                    <img src="img/plus-hover.svg">
                    Добавить контакт
                `;
            });
        });
        btnAddContactForm.forEach(i => {
            i.addEventListener('mouseout', () => {
                i.innerHTML = `
                    <img src="img/plus.svg">
                    Добавить контакт
                `;
            });
        });
    }

    // Добавляем контакт
    function addClient() {
        hoverAddContact();

        btnAddContactForm[0].addEventListener('click', () => {
            contactForms.append(createAddContactForm());
            ++countForms;
            if (countForms >= 10) {
                btnAddContactForm[0].style.display = 'none';
            }
        });

        btnSave.addEventListener('click', () => {
            let contacts = [];
            for (let i = 0; i < contactForms.childNodes.length; ++i) {
                if (contactForms.childNodes[i].childNodes[0].value.trim() && contactForms.childNodes[i].childNodes[1].value.trim()) {
                    contacts.push({ type: contactForms.childNodes[i].childNodes[0].value.trim(), value: contactForms.childNodes[i].childNodes[1].value.trim() });
                    console.log('ok');
                }
                console.log(contacts);
            }

            fetch('http://localhost:3000/api/clients', {
                method: 'POST',
                body: JSON.stringify({
                    name: inputName[0].value.trim().toLowerCase(),
                    surname: inputSurname[0].value.trim().toLowerCase(),
                    lastName: inputMiddleName[0].value.trim().toLowerCase(),
                    contacts: contacts
                }),
                headers: {
                    'Content-type': 'application/json'
                }
            });
        });
    }

    // Меняем label
    function toggleLabel() {
        inputSurname.forEach(i => {
            i.addEventListener('input', () => {
                surnamePlaceholder.forEach(i => {
                    i.classList.remove('surname-placeholder');
                    i.classList.add('surname-placeholder-change');
                });
                if (!i.value) {
                    surnamePlaceholder.forEach(i => {
                        i.classList.remove('surname-placeholder-change');
                        i.classList.add('surname-placeholder');
                    });
                }
            });
        });
        inputName.forEach(i => {
            i.addEventListener('input', () => {
                namePlaceholder.forEach(i => {
                    i.classList.remove('name-placeholder');
                    i.classList.add('name-placeholder-change');
                });
                if (!i.value) {
                    namePlaceholder.forEach(i => {
                        i.classList.remove('name-placeholder-change');
                        i.classList.add('name-placeholder');
                    });
                }
            });
        });
        inputMiddleName.forEach(i => {
            i.addEventListener('input', () => {
                middleNamePlaceholder.forEach(i => {
                    i.classList.remove('middle-name-placeholder');
                    i.classList.add('middle-name-placeholder-change');
                });
                if (!i.value) {
                    middleNamePlaceholder.forEach(i => {
                        i.classList.remove('middle-name-placeholder-change');
                        i.classList.add('middle-name-placeholder');
                    });
                }
            });
        });
    }

    // Заголовок для изменения контакта
    function createChangeModalTitle(id) {
        changeModalHeader.innerHTML = `
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        `;
        const modalTitle = document.createElement('h5'),
              idClient = document.createElement('span');

        modalTitle.classList.add('modal-title');
        modalTitle.textContent = 'Измененить данные';
        idClient.classList.add('modal-id');
        idClient.textContent = `ID: ${id}`;
        modalTitle.append(idClient);

        return modalTitle;
    }

    // Изменение клиента
    async function changeClient(id) {
        const response = await fetch(`http://localhost:3000/api/clients/${id}`),
              data = await response.json();

        surnamePlaceholder[1].classList.remove('surname-placeholder');
        surnamePlaceholder[1].classList.add('surname-placeholder-change');
        namePlaceholder[1].classList.remove('name-placeholder');
        namePlaceholder[1].classList.add('name-placeholder-change');
        middleNamePlaceholder[1].classList.remove('middle-name-placeholder');
        middleNamePlaceholder[1].classList.add('middle-name-placeholder-change');
        
        inputName[1].value = data.name.substr(0, 1).toUpperCase() + data.name.substr(1).toLowerCase();
        inputSurname[1].value = data.surname.substr(0, 1).toUpperCase() + data.surname.substr(1).toLowerCase();
        inputMiddleName[1].value = data.lastName.substr(0, 1).toUpperCase() + data.lastName.substr(1).toLowerCase();
    }

    // Отрисовка таблицы
    function displayTable(arr) {
        arr.forEach(i => {
            tbody.append(createContact(i));
        });
    }

    // Приложение
    async function appContacts(url) {
        const response = await fetch(url);
        const data = await response.json();

        displayTable(data.sort((a, b) => {
            if (a.id < b.id) return -1;
            if (a.id > b.id) return 1;
            return 0;
        }));

        // Сортировка по заголовкам таблицы
        sort(data);

        // Меняем label
        toggleLabel();

        // Добавление клиента
        addClient();
    }

    appContacts('http://localhost:3000/api/clients');
})();
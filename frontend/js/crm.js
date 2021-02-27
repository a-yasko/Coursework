(() => {
    // Константы 
    const tbody = document.querySelector('.table tbody'),
          theads = document.querySelectorAll('.table thead tr th'),
          inputSearch = document.querySelector('#search'),
          contactForms = document.querySelectorAll('#contact-forms'),
          surnamePlaceholder = document.querySelectorAll('.surname-placeholder'),
          namePlaceholder = document.querySelectorAll('.name-placeholder'),
          middleNamePlaceholder = document.querySelectorAll('.middle-name-placeholder'),
          inputSurname = document.querySelectorAll('#surname'),
          inputName = document.querySelectorAll('#name'),
          inputMiddleName = document.querySelectorAll('#middle-name'),
          btnAddContactForm = document.querySelectorAll('#btn-add-contact-form'),
          btnSave = document.querySelector('#btn-save'),
          btnCreate = document.querySelector('.btn-create'),
          modalContent = document.querySelector('#modal .modal-content'),
          changeModalHeader = document.querySelector('#modalChangeContact .modal-header');

    // Создание строки
    function createContact(data) {
        // Форматируем дату создания
        let minCreate = new Date(data.createdAt).getMinutes(),
            hoursCreate = new Date(data.createdAt).getHours(),
            ddCreate = new Date(data.createdAt).getDate(),
            mmCreate = new Date(data.createdAt).getMonth() + 1,
            yyyyCreate = new Date(data.createdAt).getFullYear();

        if (ddCreate < 10) {ddCreate = '0' + ddCreate;}
        if (mmCreate < 10) {mmCreate = '0' + mmCreate;}
        if (hoursCreate < 10) {hoursCreate = '0' + hoursCreate;}
        if (minCreate < 10) {minCreate = '0' + minCreate;}

        // Форматируем дату редактирования
        let minChange = new Date(data.updatedAt).getMinutes(),
            hoursChange = new Date(data.updatedAt).getHours(),
            ddChange = new Date(data.updatedAt).getDate(),
            mmChange = new Date(data.updatedAt).getMonth() + 1,
            yyyyChange = new Date(data.updatedAt).getFullYear();

        if (ddChange < 10) {ddChange = '0' + ddChange;}
        if (mmChange < 10) {mmChange = '0' + mmChange;}
        if (hoursChange < 10) {hoursChange = '0' + hoursChange;}
        if (minChange < 10) {minChange = '0' + minChange;}

        
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
        aChange.setAttribute('data-bs-target', '#modal');
        aChange.setAttribute('data-id', data.id);
        aChange.innerHTML = `
            <img src="img/change.svg">
            Изменить
        `;
        aChange.addEventListener('click', () => {
            changeClient(aChange.getAttribute('data-id'));
        });

        aDelete.setAttribute('id', 'delete');
        aDelete.setAttribute('data-bs-toggle', 'modal');
        aDelete.setAttribute('data-bs-target', '#modal');
        aDelete.setAttribute('data-id', data.id);
        aDelete.innerHTML = `
            <img src="img/delete.svg">
            Удалить
        `;
        td.append(aChange);
        td.append(aDelete);
        tr.append(td);

        aDelete.addEventListener('click', () => {
            modalContent.innerHTML = '';
            modalContent.classList.remove('modal-create-client', 'modal-change-client');
            modalContent.classList.add('modal-delete-client');
            deleteClient(aDelete.getAttribute('data-id'));
        });

        return tr;
    }

    // Tooltips
    let tooltipElem;

    document.onmouseover = function(event) {
        let target = event.target;

        // если у нас есть подсказка...
        let tooltipHtml = target.dataset.tooltip;
        if (!tooltipHtml) {return;}

        // ...создадим элемент для подсказки
        tooltipElem = document.createElement('div');
        tooltipElem.className = 'tooltip-test';
        tooltipElem.innerHTML = tooltipHtml;
        document.body.append(tooltipElem);

        // спозиционируем его сверху от аннотируемого элемента (top-center)
        let coords = target.getBoundingClientRect();

        let left = coords.left + (target.offsetWidth - tooltipElem.offsetWidth) / 2;
        if (left < 0) {left = 0;} // не заезжать за левый край окна

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
                if (a.id < b.id) {return arg1;}
                if (a.id > b.id) {return arg2;}
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
                if (a.surname + a.name + a.middleName < b.surname + b.name + b.middleName) {return arg1;}
                if (a.surname + a.name + a.middleName > b.surname + b.name + b.middleName) {return arg2;}
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
                if (a.createdAt < b.createdAt) {return arg1;}
                if (a.createdAt > b.createdAt) {return arg2;}
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
                if (a.updatedAt < b.updatedAt) {return arg1;}
                if (a.updatedAt > b.updatedAt) {return arg2;}
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

    // Создаем заголовок для модального окна
    function createModalHeader(textContent, paddingLeft = '13px', id = '', idText = '') {
        const modalHeader = document.createElement('div'),
              modalTitle = document.createElement('h5'),
              idClient = document.createElement('span'),
              btnClose = document.createElement('button');

        modalHeader.classList.add('modal-header');
        modalTitle.classList.add('modal-title');
        modalTitle.style.left = paddingLeft;
        modalTitle.textContent = textContent;
        modalTitle.append(idClient);
        idClient.classList.add('modal-id');
        idClient.textContent = idText + ' ' + id;
        btnClose.classList.add('btn-close');
        btnClose.setAttribute('type', 'button');
        btnClose.setAttribute('data-bs-dismiss', 'modal');
        btnClose.setAttribute('aria-label', 'Close');

        modalHeader.append(modalTitle, btnClose);

        return modalHeader;
    }

    // Удаление контакта
    function deleteClient(id) {
        modalContent.append(createModalHeader('Удалить клиента', '30%'));

        const modalBody = document.createElement('div'),
              text = document.createElement('p'),
              btnDelete = document.createElement('button'),
              cancel = document.createElement('a'),
              br = document.createElement('br');

        modalBody.classList.add('modal-body', 'text-center');
        text.innerHTML = 'Вы действительно хотите удалить<br> данного клиента?';
        btnDelete.classList.add('btn', 'btn-modal');
        btnDelete.textContent = 'Удалить';
        cancel.setAttribute('href', '');
        cancel.setAttribute('data-bs-dismiss', 'modal');
        cancel.textContent = 'Отмена';

        modalBody.append(text, btnDelete, br, cancel);
        modalContent.append(modalBody);

        btnDelete.addEventListener('click', () => {
            fetch(`http://localhost:3000/api/clients/${id}`, {
                method: 'DELETE'
            });
        });
    }

    // Форма для контакта
    let countContactsForms = 0;

    function createForm(surenameValue = '', nameValue = '', middleNameValue = '') {
        const modalBody = document.createElement('div'),
              form = document.createElement('form'),
              inputs = document.createElement('div'),
              surname = document.createElement('div'),
              name = document.createElement('div'),
              middleName = document.createElement('div'),
              inputSurname = document.createElement('input'),
              inputName = document.createElement('input'),
              inputMiddleName = document.createElement('input'),
              createContacts = document.createElement('div'),
              contactsForm = document.createElement('div'),
              btnAddContactForm = document.createElement('span');

        modalBody.classList.add('modal-body');
        inputs.classList.add('inputs');
        surname.classList.add('mb-3', 'surname-placeholder');
        name.classList.add('mb-3', 'name-placeholder');
        middleName.classList.add('mb-3', 'middle-name-placeholder');
        inputSurname.classList.add('form-control');
        inputSurname.setAttribute('type', 'text');
        inputSurname.setAttribute('required', '');
        inputSurname.value = surenameValue;
        inputName.classList.add('form-control');
        inputName.setAttribute('type', 'text');
        inputName.setAttribute('required', '');
        inputName.value = nameValue;
        inputMiddleName.classList.add('form-control');
        inputMiddleName.setAttribute('type', 'text');
        inputMiddleName.value = middleNameValue;

        surname.append(inputSurname);
        name.append(inputName);
        middleName.append(inputMiddleName);

        createContacts.classList.add('create-contacts', 'text-center');
        contactsForm.classList.add('contact-forms');
        btnAddContactForm.innerHTML = `
        <img src="img/plus.svg" alt="">
        Добавить контакт
        `;

        createContacts.append(contactsForm, btnAddContactForm);

        inputs.append(surname, name, middleName);
        form.append(inputs, createContacts);
        modalBody.append(form);

        // Меняем стили у label
        inputSurname.addEventListener('input', () => {
            surname.classList.remove('surname-placeholder');
            surname.classList.add('surname-placeholder-change');

            if (!inputSurname.value) {
                surname.classList.remove('surname-placeholder-change');
                surname.classList.add('surname-placeholder');
            }
        });
        inputName.addEventListener('input', () => {
            name.classList.remove('name-placeholder');
            name.classList.add('name-placeholder-change');

            if (!inputName.value) {
                name.classList.remove('name-placeholder-change');
                name.classList.add('name-placeholder');
            }
        });
        inputMiddleName.addEventListener('input', () => {
            middleName.classList.remove('middle-name-placeholder');
            middleName.classList.add('middle-name-placeholder-change');

            if (!inputMiddleName.value) {
                middleName.classList.remove('middle-name-placeholder-change');
                middleName.classList.add('middle-name-placeholder');
            }
        });

        // Меняем hover у "Добавить контакт"
        btnAddContactForm.addEventListener('mouseover', () => {
            btnAddContactForm.innerHTML = `
            <img src="img/plus-hover.svg">
            Добавить контакт
            `;
        });
        btnAddContactForm.addEventListener('mouseout', () => {
            btnAddContactForm.innerHTML = `
            <img src="img/plus.svg">
            Добавить контакт
            `;
        });

        return {
            inputSurname,
            inputName,
            inputMiddleName,
            surname,
            name,
            middleName,
            btnAddContactForm,
            contactsForm,
            form,
            modalBody
        };
    }

    // Создаем форму для добавления контакта
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

        return {
            btnDeleteContact,
            inputGroup
        };
    }

    // Создаем кнопки для сохранения клиента
    function createBtnSave() {
        const btnWrapper = document.createElement('div'),
              btnSave = document.createElement('button'),
              br = document.createElement('br'),
              cancel = document.createElement('a');

        btnWrapper.classList.add('btn-wrapper', 'text-center');
        btnSave.classList.add('btn', 'btn-modal');
        btnSave.textContent = 'Сохранить';
        cancel.setAttribute('href', '');
        cancel.setAttribute('data-bs-dismiss', 'modal');
        cancel.textContent = 'Отмена';

        btnWrapper.append(btnSave, br, cancel);

        return {
            btnSave,
            btnWrapper
        };
    }

    // Добавление контакта
    function createClient() {
        btnCreate.addEventListener('click', () => {
            countContactsForms = 0;
            modalContent.innerHTML = '';
            modalContent.classList.remove('modal-delete-client', 'modal-change-client');
            modalContent.classList.add('modal-create-client');
            modalContent.append(createModalHeader('Новый клиент'));

            const modalCreateForm = createForm(),
                  modalCreateBtnSave = createBtnSave();

            modalContent.append(modalCreateForm.modalBody);
            modalCreateForm.form.append(modalCreateBtnSave.btnWrapper);

            modalCreateForm.btnAddContactForm.addEventListener('click', () => {
                const modalCreateAddContactForm = createAddContactForm();

                ++countContactsForms;
                modalCreateForm.contactsForm.append(modalCreateAddContactForm.inputGroup);
                if(countContactsForms >= 10) {
                    modalCreateForm.btnAddContactForm.style.display = 'none';
                }

                modalCreateAddContactForm.btnDeleteContact.addEventListener('click', () => {
                    --countContactsForms;
                    modalCreateAddContactForm.inputGroup.remove();
                    if (countContactsForms < 10) {
                        modalCreateForm.btnAddContactForm.style.display = 'inline-block';
                    }
                });
            });

            modalCreateBtnSave.btnSave.addEventListener('click', () => {
                let contacts = [];
                console.dir(modalCreateForm.contactsForm);
                for (let i = 0; i < modalCreateForm.contactsForm.childNodes.length; ++i) {
                    console.dir(modalCreateForm.contactsForm.childNodes[i].childNodes[0].value.trim());
                    if (modalCreateForm.contactsForm.childNodes[i].childNodes[0].value.trim() && modalCreateForm.contactsForm.childNodes[i].childNodes[1].value.trim()) {
                        contacts.push({ type: modalCreateForm.contactsForm.childNodes[i].childNodes[0].value.trim(), value: modalCreateForm.contactsForm.childNodes[i].childNodes[1].value.trim() });
                    }
                }

                fetch('http://localhost:3000/api/clients', {
                    method: 'POST',
                    body: JSON.stringify({
                        name: modalCreateForm.inputName.value.trim().toLowerCase(),
                        surname: modalCreateForm.inputSurname.value.trim().toLowerCase(),
                        lastName: modalCreateForm.inputMiddleName.value.trim().toLowerCase(),
                        contacts: contacts
                    }),
                    headers: {
                        'Content-type': 'application/json'
                    }
                });
            });
        });
    }

    // Изменение контакта
    async function changeClient(id) {
        modalContent.innerHTML = '';
        modalContent.classList.remove('modal-create-client', 'modal-delete-client');
        modalContent.classList.add('modal-change-client');

        const response = await fetch(`http://localhost:3000/api/clients/${id}`),
              data = await response.json(),
              modalCreateForm = createForm(
                  data.surname.substr(0, 1).toUpperCase() + data.surname.substr(1).toLowerCase(), 
                  data.name.substr(0, 1).toUpperCase() + data.name.substr(1).toLowerCase(),
                  data.lastName.substr(0, 1).toUpperCase() + data.lastName.substr(1).toLowerCase()
              ),
              modalCreateAddContactForm = createAddContactForm();

        modalContent.append(createModalHeader('Изменить данные', '13px', id, 'ID: '));
        modalContent.append(modalCreateForm.modalBody);

        modalCreateForm.surname.classList.remove('surname-placeholder');
        modalCreateForm.surname.classList.add('surname-placeholder-change');
        modalCreateForm.name.classList.remove('name-placeholder');
        modalCreateForm.name.classList.add('name-placeholder-change');
        modalCreateForm.middleName.classList.remove('middle-name-placeholder');
        modalCreateForm.middleName.classList.add('middle-name-placeholder-change');

        for (const contact of data.contacts) {
            modalCreateForm.contactsForm.append(createAddContactForm().inputGroup);
            console.log(contact);
        }
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
            if (a.id < b.id) {return -1;}
            if (a.id > b.id) {return 1;}
            return 0;
        }));

        // Сортировка по заголовкам таблицы
        sort(data);

        // Добавление клиента
        createClient();
    }

    appContacts('http://localhost:3000/api/clients');
})();
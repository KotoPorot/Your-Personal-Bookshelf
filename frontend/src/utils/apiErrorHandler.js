// src/utils/apiErrorHandler.js
export const handleRequestError = (err) => {
    // Получаем статус ошибки (например, 404, 409, 500)
    const status = err.response ? err.response.status : 'N/A';

    // Получаем сообщение (сначала из нашего DTO, потом стандартное)
    const message = (err.response && err.response.data && err.response.data.message)
                    || err.message
                    || 'Произошла непредвиденная ошибка';

    // Вывод сообщения
    alert(`Произошла ошибка!\nКод: ${status}\nСообщение: ${message}`);

    // Также логируем в консоль для разработчика
    console.error(`Error ${status}:`, message);
};
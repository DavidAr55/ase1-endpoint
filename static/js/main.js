function formatJson(json) {
    const jsonString = JSON.stringify(json, null, 2);

    return jsonString
        .replace(/"([^"]+)":/g, '<span class="key">"$1":</span>') // Claves
        .replace(/: "([^"]+)"/g, ': <span class="string">"$1"</span>') // Strings
        .replace(/: (\d+)/g, ': <span class="number">$1</span>') // Números
        .replace(/: (true|false)/g, ': <span class="boolean">$1</span>') // Booleanos
        .replace(/: null/g, ': <span class="null">null</span>'); // Null
}

document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById("loginForm");
    const submitBtn = document.getElementById("submitBtn");
    const loader = document.getElementById("loader");
    const responseOutput = document.getElementById("responseOutput");
    
    const registerInput = document.getElementById("register");
    const passwordInput = document.getElementById("password");

    // Oculta el loader inicialmente
    loader.style.display = "none";

    form.addEventListener("submit", function(event) {
        event.preventDefault(); // Evita el envío tradicional del formulario

        // Limpia los mensajes de error previos
        clearErrors();

        let hasErrors = false;

        // Verifica si los inputs están vacíos
        if (registerInput.value.trim() === "") {
            displayError(registerInput, "El campo de Registro no puede estar vacío.");
            hasErrors = true;
        }

        if (passwordInput.value.trim() === "") {
            displayError(passwordInput, "El campo de Contraseña no puede estar vacío.");
            hasErrors = true;
        }

        // Si hay errores, no continuar
        if (hasErrors) {
            return;
        }

        // Si el formulario es válido, procede con el envío
        const formData = {
            register: registerInput.value,
            password: passwordInput.value
        };

        // Deshabilita el botón y muestra el loader
        submitBtn.disabled = true;
        loader.style.display = "block";

        fetch("/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            responseOutput.innerHTML = formatJson(data); // Formatear la respuesta JSON
            responseOutput.style.display = "block"; // Hacer visible el contenedor
        })
        .catch(error => {
            responseOutput.innerHTML = formatJson({ error: error.message }); // Mostrar error formateado
            responseOutput.style.display = "block"; // Hacer visible el contenedor
        })
        .finally(() => {
            // Volver a habilitar el botón y ocultar el loader
            submitBtn.disabled = false;
            loader.style.display = "none";
        });
    });

    // Función para mostrar errores
    function displayError(inputElement, message) {
        const error = document.createElement("div");
        error.className = "error-message"; // Clase para estilizar el error
        error.textContent = message;
        inputElement.parentElement.appendChild(error); // Añadir el error al contenedor padre
        inputElement.classList.add("input-error"); // Añadir clase para resaltar el input
    }

    // Función para limpiar mensajes de error
    function clearErrors() {
        const errors = document.querySelectorAll(".error-message");
        errors.forEach(error => error.remove()); // Remueve todos los mensajes de error

        const errorInputs = document.querySelectorAll(".input-error");
        errorInputs.forEach(input => input.classList.remove("input-error")); // Remueve clases de error en inputs
    }
});

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

    form.addEventListener("submit", function(event) {
        event.preventDefault(); // Evita que el formulario se envíe de forma normal

        const formData = {
            register: form.register.value,
            password: form.password.value
        };

        // Deshabilitar el botón y mostrar el loader
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
});
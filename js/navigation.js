function redirectTo(page, folder) {
    if (!folder) {
        folder = "";
    }

    if (folder) {
        folder += "/";
    }

    // Agrego delay para usar sonidos
    setTimeout(function () {
        window.location.href = folder + page + ".html";
    }, 150);
}
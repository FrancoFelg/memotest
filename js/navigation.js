function redirectTo(page, folder = ""){
    if(folder) folder += "/";
    window.location.href = `${folder}${page}.html`;
}
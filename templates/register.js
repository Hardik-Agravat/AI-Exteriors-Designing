

function goToLogin() {
        window.location.href = "login.html";
        return false; // stop default submission
}

function showPopupAndGoToLogin() {
      const popup = document.getElementById('popup');
      popup.classList.add('show');      // show popup
      setTimeout(() => {
        popup.classList.remove('show'); // hide popup
        window.location.href = "login.html";
      }, 2000); 
      return false; // prevent form from submitting normally
    }
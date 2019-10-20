document.addEventListener('DOMContentLoaded', () => {

    // By default, submit button is disabled
    // document.querySelector('#nameSubmit').disabled = true;

    document.querySelector('button').disabled = true

    // Enable submit button
    // document.querySelector('#nameText').onkeyup = () => {
    //     if (document.querySelector('#nameText').value.length > 0)
    //         document.querySelector('#submit').disabled = false;
    //     else
    //         document.querySelector('#submit').disabled = true;
    // };

    document.querySelector('input').onkeyup = function() {
        if (this.value.length > 0)
            this.nextElementSibling.getElementsByTagName('button')[0].disabled = false
        else
            this.nextElementSibling.getElementsByTagName('button')[0].disabled = true
      }

    // Submit name
    document.querySelector('#nameForm').onsubmit = () => {
        const name = document.querySelector('#nameText').value;
        localStorage.setItem('name', name);
        window.location.href = '/';

        // Prevent submission of form
        return false;
    };

});

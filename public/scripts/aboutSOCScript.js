

const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.getElementById('nav-menu');


navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active'); // Toggle 'active' class on menu
});


document.addEventListener("DOMContentLoaded", () => {
    const fadeInElements = document.querySelectorAll('.fade-in');



    // Add a slight delay for a smoother fade-in effect
    fadeInElements.forEach((element, index) => {
        setTimeout(() => {
            element.classList.add('visible');
        }, index * 300); // Adjust the delay as necessary
    });
    
    

});
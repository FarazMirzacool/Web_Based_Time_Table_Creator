
document.addEventListener('DOMContentLoaded', function() {
    // to Get the button element
    const startButton = document.querySelector('.btn');
    
    // to Add click event listener
    startButton.addEventListener('click', function(e) {
        e.preventDefault(); // Prevent default link behavior
        
        // to Redirect to the new page
        window.location.href = 'dashboard.php'; // Change this to your desired page
    });
});
document.addEventListener("DOMContentLoaded", function () {
    // Get references to the up, left, down, and right buttons
    var upButton = document.getElementById("up");
    var leftButton = document.getElementById("left");
    var downButton = document.getElementById("down");
    var rightButton = document.getElementById("right");

    // Add click event listeners to the buttons
    upButton.addEventListener("mousedown", (e) => { keyState.w = true; e.preventDefault(); });
    upButton.addEventListener("touchstart", (e) => { keyState.w = true; e.preventDefault(); });
    leftButton.addEventListener("mousedown", (e) => { keyState.d = true; e.preventDefault(); });
    leftButton.addEventListener("touchstart", (e) => { keyState.d = true; e.preventDefault(); });
    downButton.addEventListener("mousedown", (e) => { keyState.s = true; e.preventDefault(); });
    downButton.addEventListener("touchstart", (e) => { keyState.s = true; e.preventDefault(); });
    rightButton.addEventListener("mousedown", (e) => { keyState.a = true; e.preventDefault(); });
    rightButton.addEventListener("touchstart", (e) => { keyState.a = true; e.preventDefault(); });

    // Add release event listeners to the buttons
    upButton.addEventListener("mouseup", (e) => { keyState.w = false; e.preventDefault(); });
    upButton.addEventListener("touchend", (e) => { keyState.w = false; e.preventDefault(); });
    leftButton.addEventListener("mouseup", (e) => { keyState.d = false; e.preventDefault(); });
    leftButton.addEventListener("touchend", (e) => { keyState.d = false; e.preventDefault(); });
    downButton.addEventListener("mouseup", (e) => { keyState.s = false; e.preventDefault(); });
    downButton.addEventListener("touchend", (e) => { keyState.s = false; e.preventDefault(); });
    rightButton.addEventListener("mouseup", (e) => { keyState.a = false; e.preventDefault(); });
    rightButton.addEventListener("touchend", (e) => { keyState.a = false; e.preventDefault(); });
});

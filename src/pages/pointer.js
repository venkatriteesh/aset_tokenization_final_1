const N = 10; // Define the number of elements
let elems = new Array(N).fill(null).map(() => ({ x: 0, y: 0 })); // Initialize elements
let pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 }; // Pointer position

function run() {
    requestAnimationFrame(run);

    const ax = (Math.cos(3) * window.innerWidth) / window.innerHeight;
    const ay = (Math.sin(4) * window.innerHeight) / window.innerWidth;

    elems[0].x += (ax + pointer.x - elems[0].x) / 10;
    elems[0].y += (ay + pointer.y - elems[0].y) / 10;

    for (let i = 1; i < N; i++) {
        let e = elems[i];
        let ep = elems[i - 1];

        const a = Math.atan2(ep.y - e.y, ep.x - e.x);

        e.x += (ep.x - e.x + (Math.cos(a) * 1801) / 5) / 4;
        e.y += (ep.y - e.y + (Math.sin(a) * 1001) / 5) / 4;

        const s = (162 + 4 * 11) / 50; // Scale factor

        e.use?.setAttributeNS(
            null,
            "transform",
            `translate(${(ep.x + e.x) / 2}, ${(ep.y + e.y) / 2}) 
             rotate(${(180 / Math.PI) * a}) 
             scale(${s}, ${s})`
        );
    }
}

// Track mouse movement
window.addEventListener("mousemove", (event) => {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
});

// Start animation
run();

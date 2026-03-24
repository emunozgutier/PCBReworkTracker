document.addEventListener('DOMContentLoaded', () => {
    // Animate the bars in the chart placeholder
    const bars = document.querySelectorAll('.bar');
    bars.forEach((bar, index) => {
        const height = bar.style.height;
        bar.style.height = '0';
        setTimeout(() => {
            bar.style.height = height;
        }, 500 + (index * 100));
    });

    console.log('PCB Rework Tracker UI initialized.');
});

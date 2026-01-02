document.addEventListener("DOMContentLoaded", function() {

    const saveBtn = document.getElementById("saveHowToUseSegments");
    const prodIdInput = document.getElementById("prodId");

    if (!saveBtn) {
        console.error("Save Segments button not found!");
        return;
    }

    saveBtn.addEventListener("click", function () {

        if (!prodIdInput || !prodIdInput.value) {
            alert("Product ID missing!");
            return;
        }

        const segments = [];
        const formData = new FormData();

        document.querySelectorAll(".htu-segment").forEach((seg, index) => {
            const title = seg.querySelector(".htu-title").value.trim();
            const desc = seg.querySelector(".htu-description").value.trim();
            segments.push({ title, description: desc });
        });

        if (segments.length === 0) {
            alert("Add at least one segment.");
            return;
        }

        formData.append("segments", JSON.stringify(segments));
        formData.append("product_id", prodIdInput.value);

        fetch("https://gajendhrademo.brandmindz.com/routes/auth/shop/taste_segment.php", {
            method: "POST",
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            console.log("Response:", data);
            alert(data.message || "Segments saved successfully");
        })
        .catch(err => {
            console.error("Error:", err);
            alert("Error while saving segments.");
        });
    });

});
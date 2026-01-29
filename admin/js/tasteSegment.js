function initTasteSegmentModule() {
    console.log("👅 Initializing Taste Segment Module...");
    const saveBtn = document.getElementById("saveHowToUseSegments");
    const prodIdInput = document.getElementById("prodId");

    if (!saveBtn) {
        console.warn("Save Segments button not found (may not be in current view)");
        return;
    }

    // Remove existing listener to prevent duplicates
    const newSaveBtn = saveBtn.cloneNode(true);
    saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);

    newSaveBtn.addEventListener("click", function () {
        if (!prodIdInput || !prodIdInput.value) {
            showToast("Product ID missing!", "error");
            return;
        }

        const segments = [];
        const formData = new FormData();

        document.querySelectorAll(".htu-segment").forEach((seg, index) => {
            const titleInput = seg.querySelector(".htu-title");
            const descInput = seg.querySelector(".htu-description");

            if (titleInput && descInput) {
                const title = titleInput.value.trim();
                const desc = descInput.value.trim();
                if (title || desc) {
                    segments.push({ title, description: desc });
                }
            }
        });

        if (segments.length === 0) {
            showToast("Add at least one segment.", "warning");
            return;
        }

        formData.append("segments", JSON.stringify(segments));
        formData.append("product_id", prodIdInput.value);

        setButtonLoading(newSaveBtn, true, "Saving...");

        fetch("https://gajendhrademo.brandmindz.com/routes/auth/shop/taste_segment.php", {
            method: "POST",
            body: formData
        })
            .then(res => res.json())
            .then(data => {
                setButtonLoading(newSaveBtn, false);
                showToast(data.message || "Segments saved successfully", data.success ? "success" : "error");
            })
            .catch(err => {
                console.error("Error:", err);
                setButtonLoading(newSaveBtn, false);
                showToast("Error while saving segments.", "error");
            });
    });
}

// Attach to window
window.initTasteSegmentModule = initTasteSegmentModule;
export class Toast {
    static container = null;

    static init() {
        if (!this.container) {
            this.container = document.createElement("div");
            this.container.id = "toast-container";
            this.container.className = "fixed top-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none";
            document.body.appendChild(this.container);
        }
    }

    static show(message, type = "success", duration = 4000) {
        this.init();

        const toast = document.createElement("div");
        toast.className = `
            flex items-center gap-3 px-6 py-4 rounded-lg shadow-xl text-white transform transition-all duration-300 translate-x-10 opacity-0 pointer-events-auto min-w-[300px]
            ${type === "success" ? "bg-green-600" : type === "error" ? "bg-red-600" : "bg-blue-600"}
        `;

        const icon = type === "success" ? "fa-check-circle" : type === "error" ? "fa-exclamation-circle" : "fa-info-circle";
        
        toast.innerHTML = `
            <i class="fas ${icon} text-lg"></i>
            <span class="font-medium text-sm flex-1">${message}</span>
            <button class="text-white hover:text-gray-200 focus:outline-none" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        this.container.appendChild(toast);

        // Animate in
        requestAnimationFrame(() => {
            toast.classList.remove("translate-x-10", "opacity-0");
        });

        // Auto dismiss
        setTimeout(() => {
            toast.classList.add("translate-x-10", "opacity-0");
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    static success(msg) { this.show(msg, "success"); }
    static error(msg) { this.show(msg, "error"); }
    static info(msg) { this.show(msg, "info"); }
}

// Auto-init on import
document.addEventListener("DOMContentLoaded", () => Toast.init());

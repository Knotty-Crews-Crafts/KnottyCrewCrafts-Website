document.addEventListener("DOMContentLoaded", function () {
	var addButtons = document.querySelectorAll(".add-to-form-btn");
	var hiddenInput = document.getElementById("selectedImagesInput");
	var preview = document.getElementById("selectedImagesPreview");
	var selectedImages = [];
	var openGalleryModalBtn = document.getElementById("openGalleryModalBtn");
	var closeGalleryModalBtn = document.getElementById("closeGalleryModalBtn");
	var galleryModal = document.getElementById("galleryModal");
	var galleryModalGrid = document.getElementById("galleryModalGrid");
	var galleryModalSearch = document.getElementById("galleryModalSearch");
	var galleryModalFilters = document.getElementById("galleryModalFilters");
	var galleryModalResults = document.getElementById("galleryModalResults");
	var galleryModalEmpty = document.getElementById("galleryModalEmpty");
	var pageGalleryItems = document.querySelectorAll("#gallery .gallery > div");
	var modalGalleryItems = [];
	var activeFilter = "all";
	var searchQuery = "";

	function getSelectionLabel(imagePath, imageTitle) {
		return imageTitle + " (" + imagePath + ")";
	}

	function updateAddButtonsState() {
		document.querySelectorAll(".add-to-form-btn").forEach(function (button) {
			var imagePath = button.getAttribute("data-image") || "";
			var imageTitle = button.getAttribute("data-title") || "Image";
			var selection = getSelectionLabel(imagePath, imageTitle);

			if (selectedImages.indexOf(selection) !== -1) {
				button.textContent = "Added";
				button.disabled = true;
			} else {
				button.textContent = "Add to Form";
				button.disabled = false;
			}
		});
	}

	function toSlug(value) {
		return (value || "")
			.toLowerCase()
			.replace(/[^a-z0-9\s-]/g, "")
			.trim()
			.replace(/\s+/g, "-");
	}

	function buildFilterButtons() {
		if (!galleryModalFilters) {
			return;
		}

		galleryModalFilters.innerHTML = "";

		var allButton = document.createElement("button");
		allButton.type = "button";
		allButton.className = "gallery-filter-btn is-active";
		allButton.setAttribute("data-filter", "all");
		allButton.textContent = "All";
		galleryModalFilters.appendChild(allButton);

		var uniqueCategories = {};
		modalGalleryItems.forEach(function (item) {
			uniqueCategories[item.category] = item.categoryLabel;
		});

		Object.keys(uniqueCategories).forEach(function (category) {
			var filterButton = document.createElement("button");
			filterButton.type = "button";
			filterButton.className = "gallery-filter-btn";
			filterButton.setAttribute("data-filter", category);
			filterButton.textContent = uniqueCategories[category];
			galleryModalFilters.appendChild(filterButton);
		});

		galleryModalFilters.addEventListener("click", function (event) {
			var target = event.target;
			if (!(target instanceof HTMLButtonElement)) {
				return;
			}

			activeFilter = target.getAttribute("data-filter") || "all";

			galleryModalFilters.querySelectorAll(".gallery-filter-btn").forEach(function (button) {
				button.classList.remove("is-active");
			});
			target.classList.add("is-active");
			renderModalGallery();
		});
	}

	function renderModalGallery() {
		if (!galleryModalGrid) {
			return;
		}

		galleryModalGrid.innerHTML = "";

		var normalizedQuery = searchQuery.toLowerCase().trim();
		var filteredItems = modalGalleryItems.filter(function (item) {
			var matchesFilter = activeFilter === "all" || item.category === activeFilter;
			var matchesSearch = !normalizedQuery || item.searchText.indexOf(normalizedQuery) !== -1;
			return matchesFilter && matchesSearch;
		});

		filteredItems.forEach(function (item) {
			var modalItem = document.createElement("div");
			modalItem.className = "gallery-modal-item";

			var modalImage = document.createElement("img");
			modalImage.src = item.imagePath;
			modalImage.alt = item.altText;

			var modalTitle = document.createElement("h3");
			modalTitle.textContent = item.title;

			var modalAddButton = document.createElement("button");
			modalAddButton.type = "button";
			modalAddButton.className = "add-to-form-btn";
			modalAddButton.setAttribute("data-image", item.imagePath);
			modalAddButton.setAttribute("data-title", item.title);
			modalAddButton.textContent = "Add to Form";
			bindAddToFormButton(modalAddButton);

			modalItem.appendChild(modalImage);
			modalItem.appendChild(modalTitle);
			modalItem.appendChild(modalAddButton);
			galleryModalGrid.appendChild(modalItem);
		});

		if (galleryModalEmpty) {
			galleryModalEmpty.hidden = filteredItems.length !== 0;
		}

		if (galleryModalResults) {
			galleryModalResults.textContent = filteredItems.length + " of " + modalGalleryItems.length + " item" + (modalGalleryItems.length === 1 ? "" : "s") + " shown";
		}

		updateAddButtonsState();
	}

	function bindAddToFormButton(button) {
		button.addEventListener("click", function () {
			var imagePath = button.getAttribute("data-image") || "";
			var imageTitle = button.getAttribute("data-title") || "Image";
			var selection = getSelectionLabel(imagePath, imageTitle);

			if (selectedImages.indexOf(selection) === -1) {
				selectedImages.push(selection);
				renderSelectedImages();
				updateAddButtonsState();
			}
		});
	}

	function renderSelectedImages() {
		if (!hiddenInput || !preview) {
			return;
		}

		if (selectedImages.length === 0) {
			hiddenInput.value = "";
			preview.textContent = "No images selected yet.";
			return;
		}

		hiddenInput.value = selectedImages.join("\n");
		preview.innerHTML = selectedImages.map(function (item) {
			return "<div>" + item + "</div>";
		}).join("");
	}

	addButtons.forEach(function (button) {
		bindAddToFormButton(button);
	});

	if (galleryModal && galleryModalGrid) {
		pageGalleryItems.forEach(function (item) {
			var image = item.querySelector("img");
			var title = item.querySelector("h3");

			if (!image) {
				return;
			}

			var titleText = title ? title.textContent : "Craft";
			var category = toSlug(titleText) || "other";
			modalGalleryItems.push({
				imagePath: image.getAttribute("src") || "",
				altText: image.getAttribute("alt") || "Gallery image",
				title: titleText,
				category: category,
				categoryLabel: titleText,
				searchText: (titleText + " " + (image.getAttribute("alt") || "")).toLowerCase()
			});
		});

		buildFilterButtons();
		renderModalGallery();
	}

	if (galleryModalSearch) {
		galleryModalSearch.addEventListener("input", function () {
			searchQuery = galleryModalSearch.value || "";
			renderModalGallery();
		});
	}

	function openGalleryModal() {
		if (!galleryModal) {
			return;
		}

		galleryModal.classList.add("is-open");
		galleryModal.setAttribute("aria-hidden", "false");
		document.body.style.overflow = "hidden";

		if (galleryModalSearch) {
			galleryModalSearch.focus();
		}
	}

	function closeGalleryModal() {
		if (!galleryModal) {
			return;
		}

		galleryModal.classList.remove("is-open");
		galleryModal.setAttribute("aria-hidden", "true");
		document.body.style.overflow = "";
	}

	if (openGalleryModalBtn) {
		openGalleryModalBtn.addEventListener("click", openGalleryModal);
	}

	if (closeGalleryModalBtn) {
		closeGalleryModalBtn.addEventListener("click", closeGalleryModal);
	}

	if (galleryModal) {
		galleryModal.addEventListener("click", function (event) {
			if (event.target === galleryModal) {
				closeGalleryModal();
			}
		});
	}

	document.addEventListener("keydown", function (event) {
		if (event.key === "Escape" && galleryModal && galleryModal.classList.contains("is-open")) {
			closeGalleryModal();
		}
	});

	renderSelectedImages();
	updateAddButtonsState();
});

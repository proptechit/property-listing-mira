<section class="bg-white rounded-2xl border border-slate-200 shadow-sm" data-collapsible data-open="false">
    <div class="px-5 py-4 border-b border-slate-200 flex items-center justify-between cursor-pointer select-none" data-collapsible-toggle>
        <div class="flex items-center gap-3">
            <i class="fa-solid fa-photo-film text-slate-400"></i>
            <div>
                <h2 class="text-md font-semibold text-slate-900">Photos and Videos</h2>
                <p class="text-md text-slate-500">Manage media content</p>
            </div>
        </div>

        <i class="fa-solid fa-chevron-down text-slate-400 transition-transform duration-200" data-collapsible-icon></i>
    </div>

    <div class="transition-all duration-300 ease-in-out" data-collapsible-content>
        <div class="p-5 space-y-6">
            <!-- Photos Section -->
            <div>
                <label class="block text-md font-semibold text-slate-900 mb-4">Photos</label>

                <!-- Image Input Area -->
                <div class="mb-4 p-4 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50">
                    <div class="flex items-center justify-center flex-col gap-2">
                        <input type="file" id="imageInput" multiple accept="image/*" class="sr-only" onchange="window.handleImageInputChange && window.handleImageInputChange(event)">
                        <label for="imageInput" id="addImageBtn" role="button" tabindex="0"
                            class="inline-flex cursor-pointer items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-md transition-colors">
                            <i class="fa-solid fa-plus"></i>
                            Add Images
                        </label>
                        <p class="text-sm text-slate-500">Select images to add to the gallery or drag & drop to reorder</p>
                    </div>
                </div>

                <div class="mb-4 rounded-xl border border-slate-200 bg-white p-4">
                    <label class="inline-flex items-start gap-3 cursor-pointer">
                        <input type="checkbox" id="autoResizeImages" class="mt-1 rounded border-slate-300 text-blue-600 focus:ring-blue-500" checked>
                        <span>
                            <span class="block text-sm font-semibold text-slate-800">Auto resize images</span>
                            <span class="block text-sm text-slate-500">When enabled, new uploads are validated and resized to fit within 1400 x 1050 pixels. Minimum accepted size is 800 x 600 and aspect ratio must stay between 1.3 and 1.8, with 4:3 recommended.</span>
                        </span>
                    </label>
                </div>

                <div id="imageUploadFeedback" class="hidden mb-4 rounded-xl border px-4 py-3 text-sm"></div>

                <!-- Image Preview Grid -->
                <div id="imagePreviewGrid" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    <!-- Images will be dynamically added here -->
                </div>

                <!-- Hidden input to store image URLs -->
                <input type="hidden" name="images" id="imagesInput" value="">
            </div>

            <!-- Videos Section -->
            <div class="pt-4 border-t border-slate-200">
                <label class="block text-md font-semibold text-slate-900 mb-4">Videos</label>

                <!-- Default Video -->
                <div class="mb-4">
                    <label class="block text-sm font-medium text-slate-700 mb-2">Default Video Link</label>
                    <input type="url" name="video" id="videoInput" placeholder="https://example.com/video.mp4"
                        class="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-md text-slate-800 outline-none focus:ring-2 focus:ring-blue-500">
                    <p class="text-sm text-slate-500 mt-1">Enter a direct link to the video file or streaming URL</p>
                </div>

                <!-- 360 View Video -->
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-2">360 View Video Link</label>
                    <input type="url" name="video_360" id="video360Input" placeholder="https://example.com/video-360.mp4"
                        class="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-md text-slate-800 outline-none focus:ring-2 focus:ring-blue-500">
                    <p class="text-sm text-slate-500 mt-1">Enter a direct link to the 360-degree video</p>
                </div>
            </div>
        </div>
    </div>
</section>

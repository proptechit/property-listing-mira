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

    <div class="overflow-hidden transition-all duration-300 ease-in-out" data-collapsible-content>
        <div class="p-5 space-y-6">
            <!-- Photos Section -->
            <div>
                <label class="block text-md font-semibold text-slate-900 mb-4">Photos</label>

                <!-- Image Input Area -->
                <div class="mb-4 p-4 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50">
                    <div class="flex items-center justify-center flex-col gap-2">
                        <input type="file" id="imageInput" multiple accept="image/*" class="hidden">
                        <button type="button" id="addImageBtn"
                            class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-md transition-colors">
                            <i class="fa-solid fa-plus"></i>
                            Add Images
                        </button>
                        <p class="text-sm text-slate-500">Select images to add to the gallery or drag & drop to reorder</p>
                    </div>
                </div>

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
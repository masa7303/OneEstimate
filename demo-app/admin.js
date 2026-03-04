// admin.js - 管理画面ロジック

// 定数
const ADMIN_PASSWORD = 'admin';
const AUTH_KEY = 'admin_authenticated';

// 状態管理
let currentData = null;
let currentCompany = null;
let currentPage = 'dashboard';
let currentOptionCategory = 'kitchen';

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    checkAuth();
    setupEventListeners();
});

// 認証チェック
function checkAuth() {
    const isAuth = sessionStorage.getItem(AUTH_KEY);
    if (isAuth === 'true') {
        showAdminMain();
    } else {
        showLoginScreen();
    }
}

// ログイン画面表示
function showLoginScreen() {
    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('adminMain').classList.add('hidden');
}

// 管理画面表示
function showAdminMain() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('adminMain').classList.remove('hidden');
    loadData();
    renderCurrentPage();
}

// データ読み込み
function loadData() {
    currentData = getData();
    currentCompany = getCompanyInfo();
    updateStats();
}

// 統計情報更新
function updateStats() {
    document.getElementById('statSeries').textContent = currentData.series.length;

    let optionCount = 0;
    Object.values(currentData.options).forEach(cat => {
        optionCount += cat.items.length;
    });
    document.getElementById('statOptions').textContent = optionCount;

    document.getElementById('statSurvey').textContent = currentData.questions ? currentData.questions.length : 12;

    const variationCount =
        currentData.variations.layout.length +
        currentData.variations.roof.length +
        currentData.variations.outdoor.length;
    document.getElementById('statVariations').textContent = variationCount;
}

// イベントリスナー設定
function setupEventListeners() {
    // ログインフォーム
    document.getElementById('loginForm').addEventListener('submit', handleLogin);

    // ログアウト
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);

    // ナビゲーション
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = e.currentTarget.dataset.page;
            navigateTo(page);
        });
    });

    // クイックアクション
    document.querySelectorAll('[data-goto]').forEach(btn => {
        btn.addEventListener('click', () => {
            navigateTo(btn.dataset.goto);
        });
    });

    // データリセット
    document.getElementById('resetDataBtn').addEventListener('click', handleResetData);

    // シリーズ関連
    document.getElementById('addSeriesBtn').addEventListener('click', () => openSeriesModal());
    document.getElementById('closeSeriesModal').addEventListener('click', closeSeriesModal);
    document.getElementById('cancelSeriesBtn').addEventListener('click', closeSeriesModal);
    document.getElementById('seriesForm').addEventListener('submit', handleSeriesSave);
    document.getElementById('uploadSeriesImageBtn').addEventListener('click', () => {
        document.getElementById('seriesImageInput').click();
    });
    document.getElementById('seriesImageInput').addEventListener('change', handleSeriesImageUpload);

    // オプション関連
    document.getElementById('closeOptionModal').addEventListener('click', closeOptionModal);
    document.getElementById('cancelOptionBtn').addEventListener('click', closeOptionModal);
    document.getElementById('optionForm').addEventListener('submit', handleOptionSave);
    document.getElementById('uploadOptionImageBtn').addEventListener('click', () => {
        document.getElementById('optionImageInput').click();
    });
    document.getElementById('optionImageInput').addEventListener('change', handleOptionImageUpload);

    // 会社情報
    document.getElementById('companyForm').addEventListener('submit', handleCompanySave);
    document.getElementById('uploadLogoBtn').addEventListener('click', () => {
        document.getElementById('logoInput').click();
    });
    document.getElementById('logoInput').addEventListener('change', handleLogoUpload);

    // 仕様設定関連
    document.getElementById('closeVariationModal').addEventListener('click', closeVariationModal);
    document.getElementById('cancelVariationBtn').addEventListener('click', closeVariationModal);
    document.getElementById('variationForm').addEventListener('submit', handleVariationSave);
    document.getElementById('uploadVariationImageBtn').addEventListener('click', () => {
        document.getElementById('variationImageInput').click();
    });
    document.getElementById('variationImageInput').addEventListener('change', handleVariationImageUpload);

    // アンケート関連
    document.getElementById('closeSurveyModal').addEventListener('click', closeSurveyModal);
    document.getElementById('cancelSurveyBtn').addEventListener('click', closeSurveyModal);
    document.getElementById('surveyForm').addEventListener('submit', handleSurveySave);
    document.getElementById('surveyHasAdvice').addEventListener('change', (e) => {
        document.getElementById('surveyAdviceSection').classList.toggle('hidden', !e.target.checked);
    });
    document.getElementById('addSurveyOptionBtn').addEventListener('click', addSurveyOption);

    // モーダル外クリックで閉じる
    document.getElementById('seriesModal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('seriesModal')) {
            closeSeriesModal();
        }
    });
    document.getElementById('optionModal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('optionModal')) {
            closeOptionModal();
        }
    });
    document.getElementById('variationModal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('variationModal')) {
            closeVariationModal();
        }
    });
    document.getElementById('surveyModal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('surveyModal')) {
            closeSurveyModal();
        }
    });
}

// ログイン処理
function handleLogin(e) {
    e.preventDefault();
    const password = document.getElementById('password').value;

    if (password === ADMIN_PASSWORD) {
        sessionStorage.setItem(AUTH_KEY, 'true');
        document.getElementById('loginError').classList.add('hidden');
        showAdminMain();
    } else {
        document.getElementById('loginError').classList.remove('hidden');
    }
}

// ログアウト処理
function handleLogout() {
    sessionStorage.removeItem(AUTH_KEY);
    showLoginScreen();
    document.getElementById('password').value = '';
}

// ページ遷移
function navigateTo(page) {
    currentPage = page;

    // ナビゲーションのアクティブ状態更新
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === page) {
            link.classList.add('active');
        }
    });

    // ページタイトル更新
    const titles = {
        dashboard: 'ダッシュボード',
        series: 'シリーズ管理',
        options: 'オプション管理',
        variations: '仕様設定管理',
        survey: 'アンケート管理',
        company: '会社情報'
    };
    document.getElementById('pageTitle').textContent = titles[page] || page;

    // ページコンテンツ切り替え
    document.querySelectorAll('.page-content').forEach(section => {
        section.classList.add('hidden');
    });
    document.getElementById(`page-${page}`).classList.remove('hidden');

    renderCurrentPage();
}

// 現在のページを描画
function renderCurrentPage() {
    switch (currentPage) {
        case 'dashboard':
            renderDashboard();
            break;
        case 'series':
            renderSeriesList();
            break;
        case 'options':
            renderOptions();
            break;
        case 'variations':
            renderVariations();
            break;
        case 'survey':
            renderSurvey();
            break;
        case 'company':
            renderCompany();
            break;
    }
    lucide.createIcons();
}

// ダッシュボード描画
function renderDashboard() {
    const container = document.getElementById('seriesOverview');
    container.innerHTML = currentData.series.map(s => `
        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div class="flex items-center gap-3">
                <img src="${s.image}" alt="${s.name}" class="w-12 h-12 rounded object-cover" onerror="this.src='images/noimage.jpg'">
                <div>
                    <p class="font-medium text-gray-800">${s.name}</p>
                    <p class="text-sm text-gray-500">${formatPrice(s.basePrice)}（30坪）</p>
                </div>
            </div>
            <button data-edit-series="${s.id}" class="text-blue-600 hover:text-blue-800">
                <i data-lucide="edit" class="w-4 h-4"></i>
            </button>
        </div>
    `).join('');

    // 編集ボタンのイベント
    container.querySelectorAll('[data-edit-series]').forEach(btn => {
        btn.addEventListener('click', () => {
            navigateTo('series');
            setTimeout(() => {
                openSeriesModal(parseInt(btn.dataset.editSeries));
            }, 100);
        });
    });
}

// シリーズ一覧描画
function renderSeriesList() {
    const container = document.getElementById('seriesList');
    container.innerHTML = currentData.series.map(s => `
        <div class="series-card bg-white rounded-xl shadow-sm overflow-hidden">
            <div class="relative h-40 bg-gray-100">
                <img src="${s.image}" alt="${s.name}" class="w-full h-full object-cover" onerror="this.src='images/noimage.jpg'">
            </div>
            <div class="p-4">
                <h3 class="font-bold text-lg text-gray-800">${s.name}</h3>
                <p class="text-sm text-gray-500 mt-1">${s.desc}</p>
                <p class="text-lg font-bold text-blue-600 mt-2">${formatPrice(s.basePrice)}</p>
                <p class="text-xs text-gray-400">30坪基準価格</p>
                <div class="flex gap-2 mt-4">
                    <button data-edit-series="${s.id}" class="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition flex items-center justify-center gap-1">
                        <i data-lucide="edit" class="w-4 h-4"></i>
                        編集
                    </button>
                    <button data-delete-series="${s.id}" class="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    // イベント設定
    container.querySelectorAll('[data-edit-series]').forEach(btn => {
        btn.addEventListener('click', () => openSeriesModal(parseInt(btn.dataset.editSeries)));
    });
    container.querySelectorAll('[data-delete-series]').forEach(btn => {
        btn.addEventListener('click', () => handleDeleteSeries(parseInt(btn.dataset.deleteSeries)));
    });
}

// シリーズモーダルを開く
function openSeriesModal(id = null) {
    const modal = document.getElementById('seriesModal');
    const form = document.getElementById('seriesForm');

    if (id) {
        const series = currentData.series.find(s => s.id === id);
        if (!series) return;

        document.getElementById('seriesModalTitle').textContent = 'シリーズを編集';
        document.getElementById('seriesId').value = id;
        document.getElementById('seriesName').value = series.name;
        document.getElementById('seriesDesc').value = series.desc;
        document.getElementById('seriesBasePrice').value = series.basePrice;
        document.getElementById('seriesImage').value = series.image;

        // 仕様
        if (series.specs) {
            document.getElementById('specEarthquake').value = series.specs.earthquakeResistance || '';
            document.getElementById('specInsulation').value = series.specs.insulation || '';
            document.getElementById('specAirtightness').value = series.specs.airtightness || '';
            document.getElementById('specStructure').value = series.specs.structure || '';
            document.getElementById('specFoundation').value = series.specs.foundation || '';
            document.getElementById('specExterior').value = series.specs.exterior || '';
            document.getElementById('specWarranty').value = series.specs.warranty || '';
        }

        // 画像プレビュー
        const preview = document.getElementById('seriesImagePreview');
        preview.innerHTML = `<img src="${series.image}" alt="" class="w-full h-full object-cover" onerror="this.parentElement.innerHTML='<i data-lucide=\\'image\\' class=\\'w-8 h-8 text-gray-400\\'></i>'">`;
    } else {
        document.getElementById('seriesModalTitle').textContent = '新規シリーズ追加';
        form.reset();
        document.getElementById('seriesId').value = '';
        document.getElementById('seriesImagePreview').innerHTML = '<i data-lucide="image" class="w-8 h-8 text-gray-400"></i>';
    }

    modal.classList.remove('hidden');
    lucide.createIcons();
}

// シリーズモーダルを閉じる
function closeSeriesModal() {
    document.getElementById('seriesModal').classList.add('hidden');
}

// シリーズ保存
function handleSeriesSave(e) {
    e.preventDefault();

    const id = document.getElementById('seriesId').value;
    const seriesData = {
        name: document.getElementById('seriesName').value,
        desc: document.getElementById('seriesDesc').value,
        basePrice: parseInt(document.getElementById('seriesBasePrice').value),
        image: document.getElementById('seriesImage').value || 'images/noimage.jpg',
        specs: {
            earthquakeResistance: document.getElementById('specEarthquake').value,
            insulation: document.getElementById('specInsulation').value,
            airtightness: document.getElementById('specAirtightness').value,
            structure: document.getElementById('specStructure').value,
            foundation: document.getElementById('specFoundation').value,
            exterior: document.getElementById('specExterior').value,
            warranty: document.getElementById('specWarranty').value
        }
    };

    if (id) {
        // 編集
        const index = currentData.series.findIndex(s => s.id === parseInt(id));
        if (index !== -1) {
            currentData.series[index] = { ...currentData.series[index], ...seriesData };
        }
    } else {
        // 新規追加
        const newId = Math.max(...currentData.series.map(s => s.id), 0) + 1;
        currentData.series.push({ id: newId, ...seriesData });
    }

    saveData(currentData);
    closeSeriesModal();
    renderSeriesList();
    updateStats();
    showToast('シリーズを保存しました');
}

// シリーズ削除
function handleDeleteSeries(id) {
    if (!confirm('このシリーズを削除しますか？')) return;

    currentData.series = currentData.series.filter(s => s.id !== id);
    saveData(currentData);
    renderSeriesList();
    updateStats();
    showToast('シリーズを削除しました');
}

// シリーズ画像アップロード
function handleSeriesImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById('seriesImage').value = e.target.result;
        document.getElementById('seriesImagePreview').innerHTML =
            `<img src="${e.target.result}" alt="" class="w-full h-full object-cover">`;
    };
    reader.readAsDataURL(file);
}

// オプション描画
function renderOptions() {
    // タブ描画
    const tabContainer = document.getElementById('optionTabs');
    const categories = Object.keys(currentData.options);

    tabContainer.innerHTML = categories.map(key => {
        const cat = currentData.options[key];
        return `
            <button class="option-tab ${key === currentOptionCategory ? 'active' : ''}" data-category="${key}">
                ${cat.name}
            </button>
        `;
    }).join('');

    // タブクリックイベント
    tabContainer.querySelectorAll('.option-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            currentOptionCategory = tab.dataset.category;
            renderOptions();
        });
    });

    // コンテンツ描画
    const content = document.getElementById('optionContent');
    const category = currentData.options[currentOptionCategory];

    if (!category) return;

    content.innerHTML = `
        <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-gray-800">${category.name}</h3>
            <button id="addOptionBtn" class="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 text-sm">
                <i data-lucide="plus" class="w-4 h-4"></i>
                追加
            </button>
        </div>
        <div class="space-y-3">
            ${category.items.map((item, index) => `
                <div class="option-item">
                    <div class="flex items-center gap-4">
                        <img src="${item.image}" alt="" class="w-16 h-12 rounded object-cover bg-gray-200" onerror="this.src='images/noimage.jpg'">
                        <div>
                            <p class="font-medium text-gray-800">${item.name}</p>
                            <p class="text-sm text-blue-600 font-bold">${item.price === 0 ? '標準' : '+' + formatPrice(item.price)}</p>
                        </div>
                    </div>
                    <div class="flex gap-2">
                        <button data-edit-option="${index}" class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition">
                            <i data-lucide="edit" class="w-4 h-4"></i>
                        </button>
                        <button data-delete-option="${index}" class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition">
                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    // イベント設定
    document.getElementById('addOptionBtn').addEventListener('click', () => openOptionModal());
    content.querySelectorAll('[data-edit-option]').forEach(btn => {
        btn.addEventListener('click', () => openOptionModal(parseInt(btn.dataset.editOption)));
    });
    content.querySelectorAll('[data-delete-option]').forEach(btn => {
        btn.addEventListener('click', () => handleDeleteOption(parseInt(btn.dataset.deleteOption)));
    });

    lucide.createIcons();
}

// オプションモーダルを開く
function openOptionModal(index = null) {
    const modal = document.getElementById('optionModal');
    const category = currentData.options[currentOptionCategory];
    const preview = document.getElementById('optionImagePreview');

    document.getElementById('optionCategory').value = currentOptionCategory;

    if (index !== null && category.items[index]) {
        const item = category.items[index];
        document.getElementById('optionModalTitle').textContent = 'オプションを編集';
        document.getElementById('optionIndex').value = index;
        document.getElementById('optionName').value = item.name;
        document.getElementById('optionPrice').value = item.price;
        document.getElementById('optionImage').value = item.image || '';
        document.getElementById('optionImagePath').value = item.image && !item.image.startsWith('data:') ? item.image : '';

        // 画像プレビュー
        if (item.image) {
            preview.innerHTML = `<img src="${item.image}" alt="" class="w-full h-full object-cover" onerror="this.parentElement.innerHTML='<i data-lucide=\\'image\\' class=\\'w-6 h-6 text-gray-400\\'></i>'">`;
        } else {
            preview.innerHTML = '<i data-lucide="image" class="w-6 h-6 text-gray-400"></i>';
        }
    } else {
        document.getElementById('optionModalTitle').textContent = '新規オプション追加';
        document.getElementById('optionForm').reset();
        document.getElementById('optionIndex').value = '';
        document.getElementById('optionImage').value = '';
        document.getElementById('optionImagePath').value = '';
        preview.innerHTML = '<i data-lucide="image" class="w-6 h-6 text-gray-400"></i>';
    }

    modal.classList.remove('hidden');
    lucide.createIcons();
}

// オプションモーダルを閉じる
function closeOptionModal() {
    document.getElementById('optionModal').classList.add('hidden');
}

// オプション画像アップロード
function handleOptionImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById('optionImage').value = e.target.result;
        document.getElementById('optionImagePath').value = '';
        document.getElementById('optionImagePreview').innerHTML =
            `<img src="${e.target.result}" alt="" class="w-full h-full object-cover">`;
    };
    reader.readAsDataURL(file);
}

// 仕様設定画像アップロード
function handleVariationImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById('variationImage').value = e.target.result;
        document.getElementById('variationImagePath').value = '';
        document.getElementById('variationImagePreview').innerHTML =
            `<img src="${e.target.result}" alt="" class="w-full h-full object-cover">`;
    };
    reader.readAsDataURL(file);
}

// オプション保存
function handleOptionSave(e) {
    e.preventDefault();

    const category = document.getElementById('optionCategory').value;
    const index = document.getElementById('optionIndex').value;

    // 画像: アップロード画像優先、なければパス
    let imageValue = document.getElementById('optionImage').value;
    const imagePath = document.getElementById('optionImagePath').value.trim();
    if (imagePath && !imageValue.startsWith('data:')) {
        imageValue = imagePath;
    }

    const optionData = {
        name: document.getElementById('optionName').value,
        price: parseInt(document.getElementById('optionPrice').value),
        image: imageValue || 'images/noimage.jpg'
    };

    if (index !== '') {
        currentData.options[category].items[parseInt(index)] = optionData;
    } else {
        currentData.options[category].items.push(optionData);
    }

    saveData(currentData);
    closeOptionModal();
    renderOptions();
    updateStats();
    showToast('オプションを保存しました');
}

// オプション削除
function handleDeleteOption(index) {
    if (!confirm('このオプションを削除しますか？')) return;

    currentData.options[currentOptionCategory].items.splice(index, 1);
    saveData(currentData);
    renderOptions();
    updateStats();
    showToast('オプションを削除しました');
}

// 仕様設定描画
function renderVariations() {
    // 建物形状
    renderVariationList('layoutList', currentData.variations.layout, 'layout', '建物形状');
    // 屋根形状
    renderVariationList('roofList', currentData.variations.roof, 'roof', '屋根形状');
    // 外部空間
    renderVariationList('outdoorList', currentData.variations.outdoor, 'outdoor', '外部空間');
}

function renderVariationList(containerId, items, type, typeName) {
    const container = document.getElementById(containerId);
    container.innerHTML = `
        <div class="flex justify-end mb-3">
            <button data-add-variation="${type}" class="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 text-sm">
                <i data-lucide="plus" class="w-4 h-4"></i>
                ${typeName}を追加
            </button>
        </div>
        ${items.map((item, index) => `
            <div class="variation-item mb-2">
                <img src="${item.image}" alt="" onerror="this.src='images/noimage.jpg'">
                <div class="flex-1">
                    <p class="font-medium text-gray-800">${item.name}</p>
                    ${item.description ? `<p class="text-sm text-gray-500">${item.description}</p>` : ''}
                </div>
                <div class="text-right">
                    <p class="font-bold ${item.price >= 0 ? 'text-blue-600' : 'text-green-600'}">
                        ${item.price >= 0 ? '+' : ''}${formatPrice(item.price)}
                    </p>
                </div>
                <div class="flex gap-1 ml-2">
                    <button data-edit-variation="${type}-${index}" class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition">
                        <i data-lucide="edit" class="w-4 h-4"></i>
                    </button>
                    <button data-delete-variation="${type}-${index}" class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                </div>
            </div>
        `).join('')}
    `;

    // イベント設定
    container.querySelectorAll('[data-add-variation]').forEach(btn => {
        btn.addEventListener('click', () => openVariationModal(btn.dataset.addVariation, null));
    });
    container.querySelectorAll('[data-edit-variation]').forEach(btn => {
        const [varType, index] = btn.dataset.editVariation.split('-');
        btn.addEventListener('click', () => openVariationModal(varType, parseInt(index)));
    });
    container.querySelectorAll('[data-delete-variation]').forEach(btn => {
        const [varType, index] = btn.dataset.deleteVariation.split('-');
        btn.addEventListener('click', () => handleDeleteVariation(varType, parseInt(index)));
    });

    lucide.createIcons();
}

// 仕様設定モーダルを開く
function openVariationModal(type, index = null) {
    const modal = document.getElementById('variationModal');
    const items = currentData.variations[type];
    const preview = document.getElementById('variationImagePreview');

    const typeNames = {
        layout: '建物形状',
        roof: '屋根形状',
        outdoor: '外部空間'
    };

    document.getElementById('variationType').value = type;

    if (index !== null && items[index]) {
        const item = items[index];
        document.getElementById('variationModalTitle').textContent = `${typeNames[type]}を編集`;
        document.getElementById('variationIndex').value = index;
        document.getElementById('variationName').value = item.name;
        document.getElementById('variationDescription').value = item.description || '';
        document.getElementById('variationPrice').value = item.price;
        document.getElementById('variationImage').value = item.image || '';
        document.getElementById('variationImagePath').value = item.image && !item.image.startsWith('data:') ? item.image : '';

        // 画像プレビュー
        if (item.image) {
            preview.innerHTML = `<img src="${item.image}" alt="" class="w-full h-full object-cover" onerror="this.parentElement.innerHTML='<i data-lucide=\\'image\\' class=\\'w-8 h-8 text-gray-400\\'></i>'">`;
        } else {
            preview.innerHTML = '<i data-lucide="image" class="w-8 h-8 text-gray-400"></i>';
        }
    } else {
        document.getElementById('variationModalTitle').textContent = `${typeNames[type]}を追加`;
        document.getElementById('variationForm').reset();
        document.getElementById('variationIndex').value = '';
        document.getElementById('variationImage').value = '';
        document.getElementById('variationImagePath').value = '';
        preview.innerHTML = '<i data-lucide="image" class="w-8 h-8 text-gray-400"></i>';
    }

    modal.classList.remove('hidden');
    lucide.createIcons();
}

// 仕様設定モーダルを閉じる
function closeVariationModal() {
    document.getElementById('variationModal').classList.add('hidden');
}

// 仕様設定保存
function handleVariationSave(e) {
    e.preventDefault();

    const type = document.getElementById('variationType').value;
    const index = document.getElementById('variationIndex').value;

    // 画像: アップロード画像優先、なければパス
    let imageValue = document.getElementById('variationImage').value;
    const imagePath = document.getElementById('variationImagePath').value.trim();
    if (imagePath && !imageValue.startsWith('data:')) {
        imageValue = imagePath;
    }

    const variationData = {
        name: document.getElementById('variationName').value,
        price: parseInt(document.getElementById('variationPrice').value),
        image: imageValue || 'images/noimage.jpg'
    };

    // 外部空間の場合は説明文も保存
    if (type === 'outdoor') {
        variationData.description = document.getElementById('variationDescription').value;
    }

    if (index !== '') {
        currentData.variations[type][parseInt(index)] = variationData;
    } else {
        currentData.variations[type].push(variationData);
    }

    saveData(currentData);
    closeVariationModal();
    renderVariations();
    updateStats();
    showToast('仕様設定を保存しました');
}

// 仕様設定削除
function handleDeleteVariation(type, index) {
    if (!confirm('この仕様設定を削除しますか？')) return;

    currentData.variations[type].splice(index, 1);
    saveData(currentData);
    renderVariations();
    updateStats();
    showToast('仕様設定を削除しました');
}

// アンケート描画
function renderSurvey() {
    const container = document.getElementById('surveyList');
    const questions = currentData.questions || [];

    container.innerHTML = `
        <div class="flex justify-end mb-4">
            <button id="addSurveyBtn" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
                <i data-lucide="plus" class="w-5 h-5"></i>
                質問を追加
            </button>
        </div>
        ${questions.map((q, index) => `
            <div class="survey-item mb-3">
                <div class="survey-item-header" data-toggle-survey="${index}">
                    <div class="flex items-center gap-3 flex-1">
                        <span class="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
                            ${index + 1}
                        </span>
                        <span class="font-medium text-gray-800">${q.title}</span>
                        ${q.advice ? '<span class="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">アドバイスあり</span>' : ''}
                    </div>
                    <div class="flex items-center gap-2">
                        <button data-edit-survey="${index}" class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" onclick="event.stopPropagation()">
                            <i data-lucide="edit" class="w-4 h-4"></i>
                        </button>
                        <button data-delete-survey="${index}" class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" onclick="event.stopPropagation()">
                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                        </button>
                        <i data-lucide="chevron-down" class="w-5 h-5 text-gray-400 transition-transform"></i>
                    </div>
                </div>
                <div class="survey-item-content" data-content="${index}">
                    <div class="p-4 pt-0 space-y-3">
                        <div>
                            <label class="text-sm text-gray-500">選択肢（${q.options.length}個）</label>
                            <div class="mt-2 space-y-2">
                                ${q.options.map((opt, oi) => `
                                    <div class="flex items-center gap-2 p-2 bg-gray-50 rounded">
                                        <span class="w-6 h-6 bg-gray-200 rounded text-xs flex items-center justify-center">${String.fromCharCode(65 + oi)}</span>
                                        <span class="text-sm flex-1">${opt.label}</span>
                                        <span class="text-xs text-gray-400">${opt.value}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        ${q.advice ? `
                            <div>
                                <label class="text-sm text-gray-500">アドバイス</label>
                                <div class="mt-2 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
                                    <strong>${q.advice.title}</strong><br>
                                    ${q.advice.content}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `).join('')}
    `;

    // 追加ボタン
    document.getElementById('addSurveyBtn').addEventListener('click', () => openSurveyModal());

    // アコーディオン
    container.querySelectorAll('[data-toggle-survey]').forEach(header => {
        header.addEventListener('click', (e) => {
            if (e.target.closest('[data-edit-survey]') || e.target.closest('[data-delete-survey]')) return;
            const index = header.dataset.toggleSurvey;
            const content = container.querySelector(`[data-content="${index}"]`);
            content.classList.toggle('open');
        });
    });

    // 編集・削除ボタン
    container.querySelectorAll('[data-edit-survey]').forEach(btn => {
        btn.addEventListener('click', () => openSurveyModal(parseInt(btn.dataset.editSurvey)));
    });
    container.querySelectorAll('[data-delete-survey]').forEach(btn => {
        btn.addEventListener('click', () => handleDeleteSurvey(parseInt(btn.dataset.deleteSurvey)));
    });

    lucide.createIcons();
}

// アンケートモーダルを開く
function openSurveyModal(index = null) {
    const modal = document.getElementById('surveyModal');
    const questions = currentData.questions || [];

    if (index !== null && questions[index]) {
        const q = questions[index];
        document.getElementById('surveyModalTitle').textContent = 'アンケートを編集';
        document.getElementById('surveyIndex').value = index;
        document.getElementById('surveyTitle').value = q.title;

        // 選択肢を描画
        renderSurveyOptionsInModal(q.options);

        // アドバイス
        if (q.advice) {
            document.getElementById('surveyHasAdvice').checked = true;
            document.getElementById('surveyAdviceSection').classList.remove('hidden');
            document.getElementById('surveyAdviceTitle').value = q.advice.title;
            document.getElementById('surveyAdviceContent').value = q.advice.content;
        } else {
            document.getElementById('surveyHasAdvice').checked = false;
            document.getElementById('surveyAdviceSection').classList.add('hidden');
            document.getElementById('surveyAdviceTitle').value = '';
            document.getElementById('surveyAdviceContent').value = '';
        }
    } else {
        document.getElementById('surveyModalTitle').textContent = '新規アンケート追加';
        document.getElementById('surveyForm').reset();
        document.getElementById('surveyIndex').value = '';
        document.getElementById('surveyAdviceSection').classList.add('hidden');

        // デフォルト選択肢
        renderSurveyOptionsInModal([
            { value: '選択肢A', label: 'A：選択肢A' },
            { value: '選択肢B', label: 'B：選択肢B' },
            { value: '選択肢C', label: 'C：選択肢C' },
            { value: '選択肢D', label: 'D：選択肢D' }
        ]);
    }

    modal.classList.remove('hidden');
    lucide.createIcons();
}

// 選択肢をモーダル内に描画
function renderSurveyOptionsInModal(options) {
    const container = document.getElementById('surveyOptionsContainer');
    container.innerHTML = options.map((opt, index) => `
        <div class="flex items-center gap-2" data-option-index="${index}">
            <span class="w-6 h-6 bg-gray-200 rounded text-xs flex items-center justify-center">${String.fromCharCode(65 + index)}</span>
            <input type="text" class="flex-1 px-3 py-2 border rounded-lg text-sm"
                   data-option-value="${index}" value="${opt.value}" placeholder="値">
            <input type="text" class="flex-1 px-3 py-2 border rounded-lg text-sm"
                   data-option-label="${index}" value="${opt.label}" placeholder="表示ラベル">
            <button type="button" data-remove-option="${index}" class="p-1 text-red-500 hover:bg-red-50 rounded">
                <i data-lucide="x" class="w-4 h-4"></i>
            </button>
        </div>
    `).join('');

    // 削除ボタン
    container.querySelectorAll('[data-remove-option]').forEach(btn => {
        btn.addEventListener('click', () => {
            const optIndex = parseInt(btn.dataset.removeOption);
            const optDiv = container.querySelector(`[data-option-index="${optIndex}"]`);
            if (optDiv) optDiv.remove();
            // インデックス再割り当て
            reindexSurveyOptions();
        });
    });

    lucide.createIcons();
}

// 選択肢追加
function addSurveyOption() {
    const container = document.getElementById('surveyOptionsContainer');
    const currentCount = container.querySelectorAll('[data-option-index]').length;
    const letter = String.fromCharCode(65 + currentCount);

    const optionHtml = `
        <div class="flex items-center gap-2" data-option-index="${currentCount}">
            <span class="w-6 h-6 bg-gray-200 rounded text-xs flex items-center justify-center">${letter}</span>
            <input type="text" class="flex-1 px-3 py-2 border rounded-lg text-sm"
                   data-option-value="${currentCount}" value="" placeholder="値">
            <input type="text" class="flex-1 px-3 py-2 border rounded-lg text-sm"
                   data-option-label="${currentCount}" value="${letter}：" placeholder="表示ラベル">
            <button type="button" data-remove-option="${currentCount}" class="p-1 text-red-500 hover:bg-red-50 rounded">
                <i data-lucide="x" class="w-4 h-4"></i>
            </button>
        </div>
    `;

    container.insertAdjacentHTML('beforeend', optionHtml);

    // 削除ボタン
    const newBtn = container.querySelector(`[data-remove-option="${currentCount}"]`);
    if (newBtn) {
        newBtn.addEventListener('click', () => {
            newBtn.closest('[data-option-index]').remove();
            reindexSurveyOptions();
        });
    }

    lucide.createIcons();
}

// 選択肢のインデックス再割り当て
function reindexSurveyOptions() {
    const container = document.getElementById('surveyOptionsContainer');
    const options = container.querySelectorAll('[data-option-index]');

    options.forEach((opt, newIndex) => {
        opt.dataset.optionIndex = newIndex;
        const letter = String.fromCharCode(65 + newIndex);
        opt.querySelector('span').textContent = letter;
    });
}

// アンケートモーダルを閉じる
function closeSurveyModal() {
    document.getElementById('surveyModal').classList.add('hidden');
}

// アンケート保存
function handleSurveySave(e) {
    e.preventDefault();

    const index = document.getElementById('surveyIndex').value;
    const container = document.getElementById('surveyOptionsContainer');

    // 選択肢を収集
    const options = [];
    container.querySelectorAll('[data-option-index]').forEach(opt => {
        const idx = opt.dataset.optionIndex;
        const value = opt.querySelector(`[data-option-value="${idx}"]`).value;
        const label = opt.querySelector(`[data-option-label="${idx}"]`).value;
        if (value || label) {
            options.push({ value, label });
        }
    });

    const surveyData = {
        id: index !== '' ? currentData.questions[parseInt(index)].id : `q${(currentData.questions?.length || 0) + 1}`,
        title: document.getElementById('surveyTitle').value,
        options: options,
        advice: null
    };

    // アドバイス
    if (document.getElementById('surveyHasAdvice').checked) {
        surveyData.advice = {
            title: document.getElementById('surveyAdviceTitle').value,
            content: document.getElementById('surveyAdviceContent').value
        };
    }

    if (!currentData.questions) {
        currentData.questions = [];
    }

    if (index !== '') {
        currentData.questions[parseInt(index)] = surveyData;
    } else {
        currentData.questions.push(surveyData);
    }

    saveData(currentData);
    closeSurveyModal();
    renderSurvey();
    updateStats();
    showToast('アンケートを保存しました');
}

// アンケート削除
function handleDeleteSurvey(index) {
    if (!confirm('この質問を削除しますか？')) return;

    currentData.questions.splice(index, 1);
    saveData(currentData);
    renderSurvey();
    updateStats();
    showToast('質問を削除しました');
}

// 会社情報描画
function renderCompany() {
    document.getElementById('companyName').value = currentCompany.name || '';
    document.getElementById('companyAddress').value = currentCompany.address || '';
    document.getElementById('companyTel').value = currentCompany.tel || '';
    document.getElementById('companyFax').value = currentCompany.fax || '';
    document.getElementById('companyEmail').value = currentCompany.email || '';

    if (currentCompany.logo) {
        document.getElementById('logoPreview').innerHTML =
            `<img src="${currentCompany.logo}" alt="ロゴ" class="w-full h-full object-contain">`;
    }
}

// 会社情報保存
function handleCompanySave(e) {
    e.preventDefault();

    currentCompany = {
        name: document.getElementById('companyName').value,
        address: document.getElementById('companyAddress').value,
        tel: document.getElementById('companyTel').value,
        fax: document.getElementById('companyFax').value,
        email: document.getElementById('companyEmail').value,
        logo: currentCompany.logo
    };

    saveCompanyInfo(currentCompany);
    showToast('会社情報を保存しました');
}

// ロゴアップロード
function handleLogoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        currentCompany.logo = e.target.result;
        document.getElementById('logoPreview').innerHTML =
            `<img src="${e.target.result}" alt="ロゴ" class="w-full h-full object-contain">`;
    };
    reader.readAsDataURL(file);
}

// データリセット
function handleResetData() {
    if (!confirm('全てのデータをデフォルトに戻しますか？\nこの操作は取り消せません。')) return;

    resetData();
    loadData();
    renderCurrentPage();
    showToast('データをリセットしました');
}

// トースト表示
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastDiv = toast.querySelector('div');
    const toastMessage = document.getElementById('toastMessage');

    toastMessage.textContent = message;

    // スタイル設定
    toastDiv.className = 'px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 ';
    switch (type) {
        case 'success':
            toastDiv.classList.add('bg-green-600', 'text-white');
            break;
        case 'error':
            toastDiv.classList.add('bg-red-600', 'text-white');
            break;
        case 'warning':
            toastDiv.classList.add('bg-yellow-500', 'text-white');
            break;
    }

    toast.classList.remove('hidden');

    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

// 価格フォーマット
function formatPrice(price) {
    return '¥' + price.toLocaleString('ja-JP');
}

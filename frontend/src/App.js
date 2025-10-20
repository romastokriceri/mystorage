import React, { useState, useEffect } from 'react';
import { Camera, Package, Plus, Edit2, Trash2, LogOut, Search, Tag, ArrowLeft } from 'lucide-react';



const App = () => {
  const [token, setToken] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [boxes, setBoxes] = useState([]);
  const [selectedBox, setSelectedBox] = useState(null);
  const [items, setItems] = useState([]);
  const [view, setView] = useState('login');
  const [formData, setFormData] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (token) {
      fetchBoxes();
      fetchCurrentUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (selectedBox) {
      fetchItems(selectedBox.id);
    }
  }, [selectedBox]);

  const fetchCurrentUser = async () => {
    setCurrentUser({ username: 'Demo User' });
  };

  const fetchBoxes = async () => {
    setBoxes([
      { id: 1, name: 'Коробка 1', description: 'Літні речі', location: 'Гараж', items_count: 5 },
      { id: 2, name: 'Коробка 2', description: 'Електроніка', location: 'Кладовка', items_count: 3 },
      { id: 3, name: 'Коробка 3', description: 'Книги та документи', location: 'Шафа', items_count: 8 }
    ]);
  };

  const fetchItems = async (boxId) => {
    setItems([
      { id: 1, name: 'Футболка', description: 'Біла футболка Nike', category: 'Одяг', photo_url: '' },
      { id: 2, name: 'Кросівки', description: 'Чорні Adidas', category: 'Одяг', photo_url: '' },
      { id: 3, name: 'Навушники', description: 'Sony WH-1000XM4', category: 'Електроніка', photo_url: '' }
    ]);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setToken('demo-token-12345');
    setView('boxes');
    setFormData({});
  };

  const handleRegister = (e) => {
    e.preventDefault();
    alert('Реєстрація успішна! Увійдіть у систему');
    setView('login');
    setFormData({});
  };

  const handleLogout = () => {
    setToken(null);
    setView('login');
    setBoxes([]);
    setItems([]);
    setSelectedBox(null);
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    const newItem = {
      id: Date.now(),
      name: formData.name,
      description: formData.description || '',
      category: formData.category,
      photo_url: formData.photo_url || '',
      box_id: selectedBox.id
    };
    setItems([...items, newItem]);
    setView('boxDetail');
    setFormData({});
  };

  const handleDeleteItem = (itemId) => {
    if (window.confirm('Видалити цю річ?')) {
      setItems(items.filter(item => item.id !== itemId));
    }
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="flex items-center justify-center mb-6">
            <Package className="w-12 h-12 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">MyStorage</h1>
          <p className="text-center text-gray-600 mb-6">Твій особистий чулан</p>
          
          {view === 'login' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin(e)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Пароль</label>
                <input
                  type="password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={formData.password || ''}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin(e)}
                />
              </div>
              <button onClick={handleLogin} className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition">
                Увійти
              </button>
              <button onClick={() => setView('register')} className="w-full text-indigo-600 hover:underline">
                Немає акаунта? Зареєструватись
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ім'я користувача</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={formData.username || ''}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Пароль</label>
                <input
                  type="password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={formData.password || ''}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  onKeyPress={(e) => e.key === 'Enter' && handleRegister(e)}
                />
              </div>
              <button onClick={handleRegister} className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition">
                Зареєструватись
              </button>
              <button onClick={() => setView('login')} className="w-full text-indigo-600 hover:underline">
                Вже є акаунт? Увійти
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package className="w-8 h-8 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-800">MyStorage</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{currentUser && currentUser.username ? currentUser.username : 'Користувач'}</span>
            <button onClick={handleLogout} className="flex items-center gap-2 text-red-600 hover:text-red-700">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {view === 'boxes' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Мої коробки</h2>
              <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
                <Plus className="w-5 h-5" />
                Додати коробку
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {boxes.map(box => (
                <div
                  key={box.id}
                  onClick={() => {
                    setSelectedBox(box);
                    setView('boxDetail');
                  }}
                  className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition cursor-pointer"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Package className="w-8 h-8 text-indigo-600" />
                    <h3 className="text-xl font-semibold text-gray-800">{box.name}</h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{box.description}</p>
                  <p className="text-sm text-gray-500">📍 {box.location}</p>
                  <p className="text-sm text-indigo-600 font-medium mt-2">
                    {box.items_count || 0} речей
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'boxDetail' && selectedBox && (
          <div>
            <button
              onClick={() => {
                setView('boxes');
                setSelectedBox(null);
                setSearchTerm('');
              }}
              className="mb-4 flex items-center gap-2 text-indigo-600 hover:underline"
            >
              <ArrowLeft className="w-5 h-5" />
              Назад до коробок
            </button>
            
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{selectedBox.name}</h2>
              <p className="text-gray-600">{selectedBox.description}</p>
              <p className="text-sm text-gray-500 mt-2">📍 {selectedBox.location}</p>
            </div>

            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Пошук речей..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <button
                onClick={() => setView('addItem')}
                className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
              >
                <Plus className="w-5 h-5" />
                Додати річ
              </button>
            </div>

            {filteredItems.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Поки що немає речей у цій коробці</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map(item => (
                  <div key={item.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                    {item.photo_url ? (
                      <img src={item.photo_url} alt={item.name} className="w-full h-48 object-cover" />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                        <Camera className="w-12 h-12 text-indigo-300" />
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">{item.name}</h3>
                      <p className="text-sm text-gray-600 mb-3">{item.description || 'Без опису'}</p>
                      <div className="flex items-center gap-2 mb-3">
                        <Tag className="w-4 h-4 text-indigo-600" />
                        <span className="text-sm text-indigo-600">{item.category}</span>
                      </div>
                      <div className="flex gap-2">
                        <button className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition text-sm">
                          <Edit2 className="w-4 h-4" />
                          Редагувати
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-600 px-3 py-2 rounded-lg hover:bg-red-100 transition text-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                          Видалити
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {view === 'addItem' && selectedBox && (
          <div className="max-w-2xl mx-auto">
            <button
              onClick={() => setView('boxDetail')}
              className="mb-4 flex items-center gap-2 text-indigo-600 hover:underline"
            >
              <ArrowLeft className="w-5 h-5" />
              Назад
            </button>
            
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Додати нову річ</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Назва речі *</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Наприклад: Футболка Nike"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Опис</label>
                  <textarea
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                    rows={3}
                    value={formData.description || ''}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Додайте детальний опис..."
                  ></textarea>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Категорія *</label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    value={formData.category || ''}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="">Виберіть категорію</option>
                    <option value="Одяг">Одяг</option>
                    <option value="Електроніка">Електроніка</option>
                    <option value="Книги">Книги</option>
                    <option value="Посуд">Посуд</option>
                    <option value="Інструменти">Інструменти</option>
                    <option value="Іграшки">Іграшки</option>
                    <option value="Спорт">Спорт</option>
                    <option value="Декор">Декор</option>
                    <option value="Інше">Інше</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL фото</label>
                  <input
                    type="url"
                    placeholder="https://example.com/photo.jpg"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    value={formData.photo_url || ''}
                    onChange={(e) => setFormData({...formData, photo_url: e.target.value})}
                  />
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <Camera className="w-3 h-3" />
                    Або завантажте фото через камеру (функція буде доступна у повній версії)
                  </p>
                </div>
                
                <div className="flex gap-4 pt-4">
                  <button
                    onClick={handleAddItem}
                    disabled={!formData.name || !formData.category}
                    className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Зберегти річ
                  </button>
                  <button
                    onClick={() => {
                      setView('boxDetail');
                      setFormData({});
                    }}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition"
                  >
                    Скасувати
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
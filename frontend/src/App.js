import React, { useState, useEffect } from 'react';
import { Camera, Package, Plus, Edit2, Trash2, LogOut, Search, Tag, ArrowLeft, Users, Share2 } from 'lucide-react';

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [currentUser, setCurrentUser] = useState(null);
  const [boxes, setBoxes] = useState([]);
  const [selectedBox, setSelectedBox] = useState(null);
  const [items, setItems] = useState([]);
  const [view, setView] = useState(token ? 'boxes' : 'login');
  const [formData, setFormData] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // Автоматична синхронізація кожні 5 хвилин
  useEffect(() => {
    if (!token) return;

    const syncData = async () => {
      await fetchBoxes();
      if (selectedBox) {
        await fetchItems(selectedBox.id);
      }
    };

    syncData(); // Перша синхронізація
    const interval = setInterval(syncData, 5 * 60 * 1000); // Кожні 5 хвилин

    return () => clearInterval(interval);
  }, [token, selectedBox]);

  useEffect(() => {
    if (token) {
      fetchCurrentUser();
      fetchBoxes();
    }
  }, [token]);

  useEffect(() => {
    if (selectedBox) {
      fetchItems(selectedBox.id);
    }
  }, [selectedBox]);

  const apiRequest = async (endpoint, options = {}) => {
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(`/api${endpoint}`, config);
    
    if (response.status === 401) {
      handleLogout();
      throw new Error('Неавторизований доступ');
    }

    if (!response.ok) {
      throw new Error(`Помилка: ${response.status}`);
    }

    return response.json();
  };

  const fetchCurrentUser = async () => {
    try {
      const user = await apiRequest('/users/me');
      setCurrentUser(user);
    } catch (error) {
      console.error('Помилка завантаження користувача:', error);
    }
  };

  const fetchBoxes = async () => {
    try {
      const boxesData = await apiRequest('/boxes');
      setBoxes(boxesData);
    } catch (error) {
      console.error('Помилка завантаження коробок:', error);
    }
  };

  const fetchItems = async (boxId) => {
    try {
      const itemsData = await apiRequest(`/boxes/${boxId}/items`);
      setItems(itemsData);
    } catch (error) {
      console.error('Помилка завантаження речей:', error);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        throw new Error('Невірний email або пароль');
      }

      const data = await response.json();
      const newToken = data.access_token;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setView('boxes');
      setFormData({});
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        throw new Error('Помилка реєстрації');
      }

      alert('Реєстрація успішна! Увійдіть у систему');
      setView('login');
      setFormData({});
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setView('login');
    setBoxes([]);
    setItems([]);
    setSelectedBox(null);
    setCurrentUser(null);
  };

  const handleAddBox = async (e) => {
    e.preventDefault();
    try {
      const newBox = await apiRequest('/boxes', {
        method: 'POST',
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          location: formData.location,
        }),
      });

      setBoxes([...boxes, newBox]);
      setView('boxes');
      setFormData({});
    } catch (error) {
      alert('Помилка створення коробки');
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      const newItem = await apiRequest(`/boxes/${selectedBox.id}/items`, {
        method: 'POST',
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          category: formData.category,
          photo_url: formData.photo_url || null,
        }),
      });

      setItems([...items, newItem]);
      setView('boxDetail');
      setFormData({});
    } catch (error) {
      alert('Помилка додавання речі');
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Видалити цю річ?')) return;

    try {
      await apiRequest(`/items/${itemId}`, {
        method: 'DELETE',
      });

      setItems(items.filter(item => item.id !== itemId));
    } catch (error) {
      alert('Помилка видалення речі');
    }
  };

  const handleShareBox = async (boxId, email) => {
    try {
      await apiRequest(`/boxes/${boxId}/share`, {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      alert('Коробку поділено успішно!');
    } catch (error) {
      alert('Помилка спільного доступу');
    }
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase()))
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
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Пароль</label>
                <input
                  type="password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={formData.password || ''}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  disabled={loading}
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin(e)}
                />
              </div>
              <button 
                onClick={handleLogin} 
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {loading ? 'Вхід...' : 'Увійти'}
              </button>
              <button 
                onClick={() => setView('register')} 
                disabled={loading}
                className="w-full text-indigo-600 hover:underline disabled:text-gray-400"
              >
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
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Пароль</label>
                <input
                  type="password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={formData.password || ''}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  disabled={loading}
                  onKeyPress={(e) => e.key === 'Enter' && handleRegister(e)}
                />
              </div>
              <button 
                onClick={handleRegister} 
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {loading ? 'Реєстрація...' : 'Зареєструватись'}
              </button>
              <button 
                onClick={() => setView('login')} 
                disabled={loading}
                className="w-full text-indigo-600 hover:underline disabled:text-gray-400"
              >
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
            <span className="text-sm text-gray-600">
              {currentUser ? currentUser.username : 'Завантаження...'}
            </span>
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
              <button 
                onClick={() => setView('addBox')}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
              >
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
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Package className="w-8 h-8 text-indigo-600" />
                      <h3 className="text-xl font-semibold text-gray-800">{box.name}</h3>
                    </div>
                    {box.shared && <Users className="w-5 h-5 text-green-500" />}
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

        {view === 'addBox' && (
          <div className="max-w-2xl mx-auto">
            <button
              onClick={() => setView('boxes')}
              className="mb-4 flex items-center gap-2 text-indigo-600 hover:underline"
            >
              <ArrowLeft className="w-5 h-5" />
              Назад до коробок
            </button>
            
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Додати нову коробку</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Назва коробки *</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Наприклад: Літній одяг"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Опис</label>
                  <textarea
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                    rows={3}
                    value={formData.description || ''}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Опишіть вміст коробки..."
                  ></textarea>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Місцезнаходження</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    value={formData.location || ''}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="Наприклад: Гараж, верхня полиця"
                  />
                </div>
                
                <div className="flex gap-4 pt-4">
                  <button
                    onClick={handleAddBox}
                    disabled={!formData.name}
                    className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Створити коробку
                  </button>
                  <button
                    onClick={() => {
                      setView('boxes');
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
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">{selectedBox.name}</h2>
                  <p className="text-gray-600">{selectedBox.description}</p>
                  <p className="text-sm text-gray-500 mt-2">📍 {selectedBox.location}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const email = prompt('Введіть email користувача для спільного доступу:');
                      if (email) handleShareBox(selectedBox.id, email);
                    }}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                  >
                    <Share2 className="w-4 h-4" />
                    Поділитися
                  </button>
                </div>
              </div>
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
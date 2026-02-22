import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Camera, Package, Plus, Edit2, Trash2, LogOut, Search, Tag, ArrowLeft, Users, Share2 } from 'lucide-react';
import api from './utils/api';

const AuthForm = ({ isLogin, handleAuth, setView, loading }) => {
  const [localData, setLocalData] = useState({});
  return (
    <form onSubmit={(e) => handleAuth(e, isLogin, localData)} className="space-y-4">
      {!isLogin && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ім'я користувача</label>
          <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            value={localData.username || ''} onChange={(e) => setLocalData({...localData, username: e.target.value})} disabled={loading} required />
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input type="email" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          value={localData.email || ''} onChange={(e) => setLocalData({...localData, email: e.target.value})} disabled={loading} required />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Пароль</label>
        <input type="password" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          value={localData.password || ''} onChange={(e) => setLocalData({...localData, password: e.target.value})} disabled={loading} required />
      </div>
      <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
        {loading ? 'Завантаження...' : (isLogin ? 'Увійти' : 'Зареєструватись')}
      </button>
      <p className="text-center text-sm text-gray-600">
        {isLogin ? 'Немає акаунту? ' : 'Вже є акаунт? '}
        <button type="button" onClick={() => setView(isLogin ? 'register' : 'login')} className="text-indigo-600 hover:underline">
          {isLogin ? 'Зареєструватись' : 'Увійти'}
        </button>
      </p>
    </form>
  );
};

const FIELDS = {
  box: [
    { label: 'Назва коробки *', name: 'name', type: 'text', placeholder: 'Наприклад: Літній одяг' },
    { label: 'Опис', name: 'description', type: 'textarea', placeholder: 'Опишіть вміст коробки...' },
    { label: 'Місцезнаходження', name: 'location', type: 'text', placeholder: 'Наприклад: Гараж, верхня полиця' },
  ],
  item: [
    { label: 'Назва речі *', name: 'name', type: 'text', placeholder: 'Наприклад: Футболка Nike' },
    { label: 'Опис', name: 'description', type: 'textarea', placeholder: 'Додайте детальний опис...' },
    { label: 'Категорія *', name: 'category', type: 'select', options: ['Одяг','Електроніка','Книги','Посуд','Інструменти','Іграшки','Спорт','Декор','Інше'] },
    { label: 'URL фото', name: 'photo_url', type: 'url', placeholder: 'https://example.com/photo.jpg' },
  ]
};

const CreateForm = ({ type, onCancel, onSubmit, loading }) => {
  const [localData, setLocalData] = useState({});
  const fields = FIELDS[type];
  const handleChange = (name, value) => setLocalData(prev => ({ ...prev, [name]: value }));
  const handleSubmit = (e) => { e.preventDefault(); onSubmit(localData); };
  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={onCancel} className="mb-4 flex items-center gap-2 text-indigo-600 hover:underline">
        <ArrowLeft className="w-5 h-5" />Назад
      </button>
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {type === 'box' ? 'Додати нову коробку' : 'Додати нову річ'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map(field => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
              {field.type === 'textarea' ? (
                <textarea className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  rows={3} value={localData[field.name] || ''} onChange={(e) => handleChange(field.name, e.target.value)} placeholder={field.placeholder} />
              ) : field.type === 'select' ? (
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={localData[field.name] || ''} onChange={(e) => handleChange(field.name, e.target.value)} required={field.label.includes('*')}>
                  <option value="">Виберіть категорію</option>
                  {field.options.map(option => <option key={option} value={option}>{option}</option>)}
                </select>
              ) : (
                <input type={field.type} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={localData[field.name] || ''} onChange={(e) => handleChange(field.name, e.target.value)}
                  placeholder={field.placeholder} required={field.label.includes('*')} />
              )}
              {field.name === 'photo_url' && (
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <Camera className="w-3 h-3" />Або завантажте фото через камеру (функція буде доступна у повній версії)
                </p>
              )}
            </div>
          ))}
          <div className="flex gap-4 pt-4">
            <button type="submit" disabled={loading || !localData.name || (type === 'item' && !localData.category)}
              className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed">
              {loading ? 'Збереження...' : (type === 'box' ? 'Створити коробку' : 'Зберегти річ')}
            </button>
            <button type="button" onClick={onCancel} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition">
              Скасувати
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [currentUser, setCurrentUser] = useState(null);
  const [boxes, setBoxes] = useState([]);
  const [selectedBox, setSelectedBox] = useState(null);
  const [items, setItems] = useState([]);
  const [view, setView] = useState(token ? 'boxes' : 'login');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // ✅ useRef щоб мати актуальний selectedBox в інтервалі БЕЗ перезапуску ефекту
  const selectedBoxRef = useRef(selectedBox);
  useEffect(() => { selectedBoxRef.current = selectedBox; }, [selectedBox]);

  const onUnauthorized = useCallback(() => {
    api.clearToken(); localStorage.removeItem('token');
    setToken(null); setView('login'); setBoxes([]); setItems([]); setSelectedBox(null); setCurrentUser(null);
  }, []);

  const fetchCurrentUser = useCallback(async () => {
    try { setCurrentUser(await api.getMe()); }
    catch (error) { if (error.message === 'Unauthorized') onUnauthorized(); }
  }, [onUnauthorized]);

  const fetchBoxes = useCallback(async () => {
    try { setBoxes(await api.getBoxes()); }
    catch (error) { if (error.message === 'Unauthorized') onUnauthorized(); }
  }, [onUnauthorized]);

  const fetchItems = useCallback(async (boxId) => {
    try { setItems(await api.getItems(boxId)); }
    catch (error) { if (error.message === 'Unauthorized') onUnauthorized(); setItems([]); }
  }, [onUnauthorized]);

  // ✅ selectedBox ПРИБРАНО з залежностей — використовуємо ref
  useEffect(() => {
    if (!token) return;
    const syncData = async () => {
      await fetchBoxes();
      if (selectedBoxRef.current) await fetchItems(selectedBoxRef.current.id);
    };
    syncData();
    const interval = setInterval(syncData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [token, fetchBoxes, fetchItems]); // ← selectedBox тут більше немає!

  useEffect(() => { if (token) { fetchCurrentUser(); fetchBoxes(); } }, [token, fetchCurrentUser, fetchBoxes]);
  useEffect(() => { if (selectedBox) fetchItems(selectedBox.id); }, [selectedBox, fetchItems]);

  const handleLogout = () => onUnauthorized();

  const handleAuth = async (e, isLogin = true, localData = {}) => {
    e.preventDefault(); setLoading(true);
    try {
      if (isLogin) {
        const d = await api.login(localData.email, localData.password);
        setToken(d.access_token); api.setToken(d.access_token);
      } else {
        await api.register(localData.username, localData.email, localData.password);
        const d = await api.login(localData.email, localData.password);
        setToken(d.access_token); api.setToken(d.access_token);
      }
      setView('boxes');
    } catch (error) {
      alert(error.message || (isLogin ? 'Невірний email або пароль' : 'Помилка реєстрації'));
    } finally { setLoading(false); }
  };

  const handleCreate = async (type, localData) => {
    setLoading(true);
    try {
      if (type === 'box') {
        const newBox = await api.createBox({ name: localData.name, description: localData.description || '', location: localData.location || '' });
        setBoxes(prev => [...prev, newBox]); setView('boxes');
      } else {
        const newItem = await api.createItem({ name: localData.name, description: localData.description || '', category: localData.category, photo_url: localData.photo_url || '', box_id: selectedBox.id });
        setItems(prev => [...prev, newItem]); setView('boxDetail');
      }
    } catch (error) {
      alert('Помилка: ' + error.message);
    } finally { setLoading(false); }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Видалити цю річ?')) return;
    try { await api.deleteItem(itemId); setItems(prev => prev.filter(item => item.id !== itemId)); }
    catch (error) { alert('Помилка видалення: ' + error.message); }
  };

  const handleShareBox = async (boxId) => {
    const userEmail = prompt('Введіть email користувача для спільного доступу:');
    if (!userEmail) return;
    try { await api.shareBox(boxId, userEmail); alert('Коробку поділено успішно!'); }
    catch (error) { alert('Помилка: ' + error.message); }
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="flex items-center justify-center mb-6"><Package className="w-12 h-12 text-indigo-600" /></div>
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">MyStorage</h1>
          <p className="text-center text-gray-600 mb-6">Твій особистий чулан</p>
          {view === 'login'
            ? <AuthForm isLogin={true} handleAuth={handleAuth} setView={setView} loading={loading} />
            : <AuthForm isLogin={false} handleAuth={handleAuth} setView={setView} loading={loading} />}
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
            <span className="text-sm text-gray-600">{currentUser ? currentUser.username : 'Завантаження...'}</span>
            <button onClick={handleLogout} className="flex items-center gap-2 text-red-600 hover:text-red-700"><LogOut className="w-5 h-5" /></button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {view === 'boxes' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Мої коробки</h2>
              <button onClick={() => setView('addBox')} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
                <Plus className="w-5 h-5" />Додати коробку
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {boxes.map(box => (
                <div key={box.id} onClick={() => { setSelectedBox(box); setView('boxDetail'); }}
                  className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition cursor-pointer">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Package className="w-8 h-8 text-indigo-600" />
                      <h3 className="text-xl font-semibold text-gray-800">{box.name}</h3>
                    </div>
                    {box.shared && <Users className="w-5 h-5 text-green-500" />}
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{box.description}</p>
                  <p className="text-sm text-gray-500">📍 {box.location}</p>
                  <p className="text-sm text-indigo-600 font-medium mt-2">{box.items_count || 0} речей</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'addBox' && (
          <CreateForm type="box" loading={loading} onCancel={() => setView('boxes')} onSubmit={(d) => handleCreate('box', d)} />
        )}

        {view === 'boxDetail' && selectedBox && (
          <div>
            <button onClick={() => { setView('boxes'); setSelectedBox(null); setSearchTerm(''); }}
              className="mb-4 flex items-center gap-2 text-indigo-600 hover:underline">
              <ArrowLeft className="w-5 h-5" />Назад до коробок
            </button>
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">{selectedBox.name}</h2>
                  <p className="text-gray-600">{selectedBox.description}</p>
                  <p className="text-sm text-gray-500 mt-2">📍 {selectedBox.location}</p>
                </div>
                <button onClick={() => handleShareBox(selectedBox.id)}
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
                  <Share2 className="w-4 h-4" />Поділитися
                </button>
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="text" placeholder="Пошук речей..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
              </div>
              <button onClick={() => setView('addItem')} className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
                <Plus className="w-5 h-5" />Додати річ
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
                          <Edit2 className="w-4 h-4" />Редагувати
                        </button>
                        <button onClick={() => handleDeleteItem(item.id)}
                          className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-600 px-3 py-2 rounded-lg hover:bg-red-100 transition text-sm">
                          <Trash2 className="w-4 h-4" />Видалити
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
          <CreateForm type="item" loading={loading} onCancel={() => setView('boxDetail')} onSubmit={(d) => handleCreate('item', d)} />
        )}
      </main>
    </div>
  );
};

export default App;

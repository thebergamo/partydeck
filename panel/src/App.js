import { BrowserRouter, Route } from 'react-router-dom';
import AuthContextProvider from './auth/AuthContext';
import Login from './auth/login/Login';
import { useProfile } from './auth/profile/useProfile';
import Register from './auth/register/Register';
import GameView from './game/view/GameView';
import GameList from './shared/GameList/GameList';
import Navbar from './shared/Navigation/Navbar';

function App() {
  const profile = useProfile('');
  return (
    <BrowserRouter>
      <AuthContextProvider>
        <div className="app w-screen h-screen bg-gray-200 mx-0 overflow-y-hidden">
          <Navbar />
          <Route exact path="/">
            <GameList sharedAuthor={profile} games={profile.games} />
          </Route>
          <Route path="/game/:id">
            <GameView />
          </Route>
          <Route path="/login">
            <Login />
          </Route>
          <Route path="/start">
            <Register />
          </Route>
        </div>
      </AuthContextProvider>
    </BrowserRouter>
  );
}

export default App;

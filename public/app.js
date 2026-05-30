/**
 * ==========================================================================
 * APLICATIVO WEB DE LOGIN - INTEGRADO AO FIREBASE
 * Vanilla JavaScript (JS Puro) - SDK Modular v10
 * ==========================================================================
 */

// 1. Importação dos Módulos do Firebase via CDN (Usando o SDK v10 Modular oficial)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

/**
 * 2. Configurações de Credenciais do Firebase
 * IMPORTANTE: Substitua os placeholders abaixo pelas chaves reais do seu console do Firebase.
 * Acesse: Configurações do Projeto > Seus Aplicativos > Configuração de Aplicativos Web.
 */
const firebaseConfig = {
  apiKey: "AIzaSyA7vt37g6Sg3WAU570LHslFLVTx1hLS2Vg",
  authDomain: "teste-ce189.firebaseapp.com",
  projectId: "teste-ce189",
  storageBucket: "teste-ce189.firebasestorage.app",
  messagingSenderId: "761489542614",
  appId: "1:761489542614:web:f5fbe874a55381b4ca2877",
  measurementId: "G-FH8VKBHZG2"
};

// 3. Inicialização dos Serviços do Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 4. Seleção de Elementos DOM (Elementos da Interface)
const loginSection = document.getElementById("login-section");
const dashboardSection = document.getElementById("dashboard-section");
const loginForm = document.getElementById("login-form");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const btnLogin = document.getElementById("btn-login");
const btnLogout = document.getElementById("btn-logout");
const errorMessageDiv = document.getElementById("error-message");
const userEmailSpan = document.getElementById("user-email");
const rgbValueSpan = document.getElementById("rgb-value");
const colorDot = document.getElementById("color-dot");
const firestoreMessageDiv = document.getElementById("firestore-message");
const globalLoader = document.getElementById("global-loader");
const appContainer = document.getElementById("app-container");

// ==========================================================================
// FUNÇÕES AUXILIARES E INTERFACE
// ==========================================================================

/**
 * Define o fundo padrão escuro configurado no CSS (remove cores personalizadas)
 */
function setDefaultBackground() {
  appContainer.style.background = ""; // Remove estilo inline, voltando ao gradiente CSS padrão
  appContainer.style.backgroundColor = "";
  rgbValueSpan.textContent = "...";
  colorDot.style.backgroundColor = "transparent";
}

/**
 * Exibe ou oculta o loader de processamento visual
 * @param {boolean} show 
 */
function showLoader(show) {
  if (show) {
    globalLoader.classList.remove("hidden");
  } else {
    globalLoader.classList.add("hidden");
  }
}

/**
 * Exibe mensagem de erro de autenticação na tela de login
 * @param {string} msg 
 */
function showError(msg) {
  errorMessageDiv.textContent = msg;
  errorMessageDiv.classList.remove("hidden");
}

/**
 * Oculta a mensagem de erro da tela de login
 */
function hideError() {
  errorMessageDiv.textContent = "";
  errorMessageDiv.classList.add("hidden");
}

/**
 * Exibe mensagens informativas referentes ao Firestore na área restrita
 * @param {string} msg 
 */
function showFirestoreMessage(msg) {
  firestoreMessageDiv.textContent = msg;
  firestoreMessageDiv.classList.remove("hidden");
}

/**
 * Oculta mensagens de alertas de Firestore
 */
function hideFirestoreMessage() {
  firestoreMessageDiv.textContent = "";
  firestoreMessageDiv.classList.add("hidden");
}

/**
 * Modifica o estado visual do botão "Entrar" durante o carregamento
 * @param {boolean} isLoading 
 */
function setLoginButtonLoading(isLoading) {
  if (isLoading) {
    btnLogin.disabled = true;
    btnLogin.querySelector("span").textContent = "Entrando...";
  } else {
    btnLogin.disabled = false;
    btnLogin.querySelector("span").textContent = "Entrar";
  }
}

// ==========================================================================
// MONITORAMENTO DO ESTADO DE AUTENTICAÇÃO (onAuthStateChanged)
// ==========================================================================

/**
 * O observador onAuthStateChanged monitora ativamente se há um usuário logado.
 * É disparado automaticamente ao carregar a página e a cada alteração de login/logout.
 */
onAuthStateChanged(auth, async (user) => {
  if (user) {
    // 1. Usuário está Autenticado
    console.log('clovis de barros', user)
    showLoader(true);
    userEmailSpan.textContent = user.email;

    // Alterna visualmente as seções ocultando Login e exibindo Dashboard
    loginSection.classList.add("hidden");
    dashboardSection.classList.remove("hidden");

    // Limpa campos e feedbacks anteriores
    loginForm.reset();
    hideError();
    hideFirestoreMessage();
    setLoginButtonLoading(false);

    try {
      /**
       * 2. Busca do perfil de cores no Firestore
       * Referenciamos o documento na coleção "Cores" que possui o UID do usuário como ID.
       */
      const docRef = doc(db, "Cores", user.uid);
      const docSnap = await getDoc(docRef);
      console.log("emanuel kant", docSnap, typeof docSnap)
      if (docSnap.exists()) {
        const data = docSnap.data();

        // Verifica se o campo 'cor' existe no documento retornado
        if (data && data.cor !== undefined) {
          const rawColor = data.cor.toString().trim(); // Exemplo: "10,200,10"

          // Converte o formato textual em sintaxe CSS rgb()
          const cssColor = `rgb(${rawColor})`;

          // Aplica o valor de cor com transição suave diretamente no container principal
          appContainer.style.background = cssColor;
          appContainer.style.backgroundColor = cssColor;

          // Atualiza as informações exibidas na tela
          rgbValueSpan.textContent = rawColor;
          colorDot.style.backgroundColor = cssColor;
        } else {
          // Documento existe, mas o campo 'cor' não está definido
          showFirestoreMessage("Seu documento de preferências foi encontrado no Firestore, mas o campo 'cor' não existe.");
          setDefaultBackground();
        }
      } else {
        // O documento com o UID do usuário autenticado não existe na coleção "Cores"
        showFirestoreMessage("Nenhum perfil de cores correspondente foi encontrado para a sua conta na coleção 'Cores' do Firestore.");
        setDefaultBackground();
      }
    } catch (error) {
      console.error("Erro ao ler Firestore:", error);
      showFirestoreMessage("Erro ao buscar suas preferências no Firestore. Verifique suas regras de segurança ou conexão de rede.");
      setDefaultBackground();
    } finally {
      showLoader(false);
    }

  } else {
    // 3. Usuário está Deslogado
    loginSection.classList.remove("hidden");
    dashboardSection.classList.add("hidden");
    setDefaultBackground();
    showLoader(false);
  }
});

// ==========================================================================
// AÇÕES DO USUÁRIO (Formulário de Login & Logout)
// ==========================================================================

/**
 * Event listener que captura o submit do formulário e realiza o login via Firebase Auth
 */
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault(); // Evita o recarregamento padrão da página

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  hideError();
  setLoginButtonLoading(true);

  try {
    // Realiza a autenticação de login utilizando e-mail e senha inseridos
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error("Falha na autenticação:", error);

    // Tratamento de Erros didático e amigável baseado nos códigos do Firebase
    let friendlyMessage = "Erro ao tentar realizar login. Verifique sua conexão e tente novamente.";

    switch (error.code) {
      case "auth/invalid-email":
        friendlyMessage = "O e-mail inserido possui um formato inválido.";
        break;
      case "auth/user-disabled":
        friendlyMessage = "Esta conta de usuário foi desativada temporariamente.";
        break;
      case "auth/user-not-found":
      case "auth/wrong-password":
      case "auth/invalid-credential": // Cobre os fluxos de credenciais incorretas em SDKs recentes
        friendlyMessage = "E-mail ou senha incorretos. Por favor, verifique os dados informados.";
        break;
      case "auth/too-many-requests":
        friendlyMessage = "Acesso bloqueado temporariamente por excesso de tentativas malsucedidas.";
        break;
      case "auth/network-request-failed":
        friendlyMessage = "Erro de rede. Verifique se você está conectado à internet.";
        break;
    }

    showError(friendlyMessage);
    setLoginButtonLoading(false);
  }
});

/**
 * Event listener para efetuar logout
 */
btnLogout.addEventListener("click", async () => {
  try {
    showLoader(true);
    // Realiza a desconexão do usuário
    await signOut(auth);
  } catch (error) {
    console.error("Falha ao fazer logout:", error);
    alert("Ocorreu um erro inesperado ao desconectar-se.");
    showLoader(false);
  }
});

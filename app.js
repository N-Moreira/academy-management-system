/**
 * ==========================================================================
 * PORTAL FIT ACADEMY - CONTROLLER PRINCIPAL
 * Vanilla JavaScript (JS Puro) - Firebase SDK v10 Modular via CDN
 * ==========================================================================
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 1. CREDENCIAIS INSTITUCIONAIS DO FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyA7vt37g6Sg3WAU570LHslFLVTx1hLS2Vg",
  authDomain: "teste-ce189.firebaseapp.com",
  projectId: "teste-ce189",
  storageBucket: "teste-ce189.firebasestorage.app",
  messagingSenderId: "761489542614",
  appId: "1:761489542614:web:f5fbe874a55381b4ca2877",
  measurementId: "G-FH8VKBHZG2"
};

// 2. INICIALIZAÇÃO DO FIREBASE
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Instanciar provedor de autenticação do Google
const googleProvider = new GoogleAuthProvider();

// App secundário para criar contas de alunos sem deslogar o administrador Nicolas
const secondaryApp = initializeApp(firebaseConfig, "Secondary");
const secondaryAuth = getAuth(secondaryApp);

// ID EXCLUSIVO DO ADMINISTRADOR NICOLAS
const ADMIN_UID = "ulVCutxXEZOWYhhO74TU6rPJ97A3";

// 3. SELEÇÃO DE ELEMENTOS DOM
const pageLoader = document.getElementById("page-loader");
const landingPageWrapper = document.getElementById("landing-page-wrapper");
const dashboardWrapper = document.getElementById("dashboard-wrapper");

// Modals
const modalLogin = document.getElementById("modal-login");
const modalCadastro = document.getElementById("modal-cadastro");
const modalAula = document.getElementById("modal-aula");
const modalAluno = document.getElementById("modal-aluno");
const modalAulaTitle = document.getElementById("modal-aula-title");
const modalAlunoTitle = document.getElementById("modal-aluno-title");

// Formulários
const loginForm = document.getElementById("login-form");
const formCadastro = document.getElementById("form-cadastro");
const formAula = document.getElementById("form-aula");
const formAluno = document.getElementById("form-aluno");

// Inputs de Login
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const btnLogin = document.getElementById("btn-login");
const loginError = document.getElementById("login-error");

// Abas de Login
const tabLoginAluno = document.getElementById("tab-login-aluno");
const tabLoginAdmin = document.getElementById("tab-login-admin");

// Inputs de Auto Cadastro
const cadastroNome = document.getElementById("cadastro-nome");
const cadastroEmail = document.getElementById("cadastro-email");
const cadastroPassword = document.getElementById("cadastro-password");
const cadastroError = document.getElementById("cadastro-error");
const btnCadastro = document.getElementById("btn-cadastro");
const btnLoginGoogle = document.getElementById("btn-login-google");
const btnCadastroGoogle = document.getElementById("btn-cadastro-google");

// Botões de Navegação & Gatilhos de Modais
const btnNavAluno = document.getElementById("btn-nav-aluno");
const btnNavAdmin = document.getElementById("btn-nav-admin");
const btnNavCadastrar = document.getElementById("btn-nav-cadastrar");
const btnHeroMatricula = document.getElementById("btn-hero-matricula");
const logoHome = document.getElementById("logo-home");
const logoDashboard = document.getElementById("logo-dashboard");

const btnCloseModalLogin = document.getElementById("btn-close-modal-login");
const btnCloseModalCadastro = document.getElementById("btn-close-modal-cadastro");

// Elementos do Dashboard
const dashboardSection = document.getElementById("dashboard-section");
const btnLogout = document.getElementById("btn-logout");
const userAvatar = document.getElementById("user-avatar");
const userDisplayName = document.getElementById("user-display-name");
const userDisplayRole = document.getElementById("user-display-role");

const alunoPanel = document.getElementById("aluno-panel");
const studentClassesGrid = document.getElementById("student-classes-grid");
const alunoApprovedContent = document.getElementById("aluno-approved-content");
const alunoPendingContent = document.getElementById("aluno-pending-content");

const adminPanel = document.getElementById("admin-panel");
const tabAulas = document.getElementById("tab-aulas");
const tabAlunos = document.getElementById("tab-alunos");
const tabPermissoes = document.getElementById("tab-permissoes");
const badgePermissoesCount = document.getElementById("badge-permissoes-count");

const subpanelAulas = document.getElementById("subpanel-aulas");
const subpanelAlunos = document.getElementById("subpanel-alunos");
const subpanelPermissoes = document.getElementById("subpanel-permissoes");

const searchAulas = document.getElementById("search-aulas");
const searchAlunos = document.getElementById("search-alunos");
const searchPermissoes = document.getElementById("search-permissoes");

const tableAulasBody = document.getElementById("table-aulas-body");
const tableAlunosBody = document.getElementById("table-alunos-body");
const tablePermissoesBody = document.getElementById("table-permissoes-body");

const btnAddAula = document.getElementById("btn-add-aula");
const btnAddAluno = document.getElementById("btn-add-aluno");

// Inputs de Aula (Admin)
const aulaIdInput = document.getElementById("aula-id");
const aulaNomeInput = document.getElementById("aula-nome");
const aulaAlunoSelect = document.getElementById("aula-aluno"); // Hidden Input
const aulaAlunoSearch = document.getElementById("aula-aluno-search");
const aulaAlunoOptions = document.getElementById("aula-aluno-options");
const aulaInstrutorSelect = document.getElementById("aula-instrutor");
const aulaHorarioInput = document.getElementById("aula-horario");
const aulaSalaInput = document.getElementById("aula-sala");
const btnCloseModalAula = document.getElementById("btn-close-modal-aula");
const btnCancelarAula = document.getElementById("btn-cancelar-aula");

// Inputs de Aluno (Admin)
const alunoIdInput = document.getElementById("aluno-id");
const alunoNomeInput = document.getElementById("aluno-nome");
const alunoEmailInput = document.getElementById("aluno-email");
const alunoUidInput = document.getElementById("aluno-uid");
const btnCloseModalAluno = document.getElementById("btn-close-modal-aluno");
const btnCancelarAluno = document.getElementById("btn-cancelar-aluno");

// 4. ESTADO DO APLICATIVO
let currentUser = null;
let currentRole = "aluno"; // 'aluno' | 'admin'
let loginSelectedRole = "aluno"; // 'aluno' | 'admin'
let globalAlunos = []; // Cache local de alunos para pesquisas e vinculações
let globalAulas = []; // Cache local de aulas para pesquisas
let globalSolicitacoes = []; // Cache local de solicitações de matrícula pendentes
let globalPermissoes = []; // Cache local de solicitações combinadas para a aba Permissões
let unsubscribeAlunos = null;
let unsubscribeAulas = null;
let unsubscribePermissoes = null;


// ==========================================================================
// FUNÇÕES AUXILIARES DA USER INTERFACE
// ==========================================================================

function showPageLoader(show, text = "Carregando...") {
  if (show) {
    pageLoader.querySelector("p").textContent = text;
    pageLoader.classList.remove("hidden");
  } else {
    pageLoader.classList.add("hidden");
  }
}

function openModal(modal) {
  modal.classList.add("open");
}

function closeModal(modal) {
  modal.classList.remove("open");
  
  // Limpa formulários ao fechar
  if (modal === modalAula) formAula.reset();
  if (modal === modalAluno) formAluno.reset();
  if (modal === modalLogin) {
    loginForm.reset();
    loginError.classList.add("hidden");
    btnLogin.disabled = false;
    btnLogin.querySelector("span").textContent = "Entrar no Portal";
  }
  if (modal === modalCadastro) {
    formCadastro.reset();
    cadastroError.classList.add("hidden");
    btnCadastro.disabled = false;
    btnCadastro.querySelector("span").textContent = "Matricular-se";
  }
}

function switchAdminTab(activeTab) {
  tabAulas.classList.remove("active");
  tabAlunos.classList.remove("active");
  tabPermissoes.classList.remove("active");
  
  subpanelAulas.classList.add("hidden");
  subpanelAlunos.classList.add("hidden");
  subpanelPermissoes.classList.add("hidden");

  if (activeTab === "aulas") {
    tabAulas.classList.add("active");
    subpanelAulas.classList.remove("hidden");
  } else if (activeTab === "alunos") {
    tabAlunos.classList.add("active");
    subpanelAlunos.classList.remove("hidden");
  } else if (activeTab === "permissoes") {
    tabPermissoes.classList.add("active");
    subpanelPermissoes.classList.remove("hidden");
  }
}


/**
 * Formata strings de data e hora obtidas do campo datetime-local do HTML5
 * @param {string} datetimeStr (Ex: "2026-05-23T19:00")
 * @returns {string} (Ex: "23/05/2026 às 19:00")
 */
function formatarDataHora(datetimeStr) {
  if (!datetimeStr) return "-";
  try {
    if (datetimeStr.includes("T")) {
      const [data, hora] = datetimeStr.split("T");
      const [ano, mes, dia] = data.split("-");
      return `${dia}/${mes}/${ano} às ${hora}`;
    }
    return datetimeStr;
  } catch (err) {
    return datetimeStr;
  }
}

// SVG Icons em String para reutilização rápida
const editIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>`;
const deleteIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>`;

// ==========================================================================
// MONITORAMENTO DE SEGURANÇA E LOGIN
// ==========================================================================

onAuthStateChanged(auth, async (user) => {
  showPageLoader(true, "Verificando credenciais...");
  
  if (unsubscribeAlunos) { unsubscribeAlunos(); unsubscribeAlunos = null; }
  if (unsubscribeAulas) { unsubscribeAulas(); unsubscribeAulas = null; }
  if (unsubscribePermissoes) { unsubscribePermissoes(); unsubscribePermissoes = null; }


  if (user) {
    currentUser = user;
    
    // Ocultar página institucional e exibir dashboard
    landingPageWrapper.classList.add("hidden");
    dashboardWrapper.classList.remove("hidden");
    
    // Garantir fechamento de modais de entrada
    closeModal(modalLogin);
    closeModal(modalCadastro);

    // Determinar se o usuário é o Administrador Nicolas ou Aluno normal
    if (user.uid === ADMIN_UID) {
      currentRole = "admin";
      userDisplayRole.textContent = "Administrador";
      userDisplayRole.className = "profile-role admin-role";
      userDisplayName.textContent = "Nicolas";
      userAvatar.textContent = "N";
      userAvatar.className = "profile-avatar admin-avatar";

      dashboardSection.classList.remove("hidden");
      adminPanel.classList.remove("hidden");
      alunoPanel.classList.add("hidden");

      // Iniciar fluxos em tempo real do Administrador (Firestore Realtime)
      startAdminRealtimeListeners();
    } else {
      currentRole = "aluno";
      userDisplayRole.textContent = "Aluno";
      userDisplayRole.className = "profile-role";
      userAvatar.className = "profile-avatar";
      userAvatar.textContent = (user.email ? user.email.charAt(0).toUpperCase() : "U");

      // Buscar nome completo e status do aluno cadastrado no Firestore
      try {
        const studentDoc = await getDoc(doc(db, "alunos", user.uid));
        if (studentDoc.exists()) {
          const studentData = studentDoc.data();
          userDisplayName.textContent = studentData.nome;
          userAvatar.textContent = studentData.nome.charAt(0).toUpperCase();
          
          const cardEl = alunoPendingContent.querySelector(".pending-approval-card");
          const titleEl = alunoPendingContent.querySelector(".pending-title");
          const msgEl = alunoPendingContent.querySelector(".pending-message");
          const subEl = alunoPendingContent.querySelector(".pending-subtitle");
          const badgeEl = alunoPendingContent.querySelector(".pending-status-badge");

          if (studentData.aprovado === "proibido") {
            // Aluno suspenso/bloqueado
            cardEl.classList.add("blocked-card");
            titleEl.innerHTML = "Acesso <span>Bloqueado / Suspenso</span>";
            msgEl.innerHTML = "Olá! Seu acesso ao ecossistema <strong>Fit Academy</strong> foi suspenso.";
            subEl.innerHTML = "Seu acesso às aulas e agendamentos foi temporariamente suspenso pelo administrador <strong>Nicolas</strong>. Por favor, entre em contato com a recepção da academia.";
            badgeEl.innerHTML = "Status: Acesso Bloqueado";

            alunoApprovedContent.classList.add("hidden");
            alunoPendingContent.classList.remove("hidden");
          } else if (studentData.aprovado === "pendente" || studentData.aprovado === false) {
            // Aluno pendente
            cardEl.classList.remove("blocked-card");
            titleEl.innerHTML = "Cadastro <span>Pendente de Aprovação</span>";
            msgEl.innerHTML = "Olá! Seu cadastro foi recebido com sucesso no ecossistema <strong>Fit Academy</strong>.";
            subEl.innerHTML = "Para garantir a segurança de todos os membros, seu acesso está aguardando a liberação por parte do coordenador técnico <strong>Nicolas</strong>.";
            badgeEl.innerHTML = "Status: Aguardando Liberação";

            alunoApprovedContent.classList.add("hidden");
            alunoPendingContent.classList.remove("hidden");
          } else {
            // Aluno liberado
            alunoApprovedContent.classList.remove("hidden");
            alunoPendingContent.classList.add("hidden");
            // Iniciar fluxos em tempo real do Aluno (Apenas suas aulas)
            startStudentRealtimeListener(user.uid);
          }
        } else {
          // Autocorreção: Se o perfil do aluno no Firestore não existe, cria como 'pendente'
          userDisplayName.textContent = user.email || "Aluno";
          const userNome = user.displayName || (user.email ? user.email.split("@")[0] : "Aluno");
          userAvatar.textContent = userNome.charAt(0).toUpperCase();
          
          const cardEl = alunoPendingContent.querySelector(".pending-approval-card");
          const titleEl = alunoPendingContent.querySelector(".pending-title");
          const msgEl = alunoPendingContent.querySelector(".pending-message");
          const subEl = alunoPendingContent.querySelector(".pending-subtitle");
          const badgeEl = alunoPendingContent.querySelector(".pending-status-badge");

          // Gravar reativamente no Firestore
          await setDoc(doc(db, "alunos", user.uid), {
            nome: userNome,
            email: user.email || "",
            aprovado: "pendente",
            dataCadastro: new Date().toISOString()
          });

          cardEl.classList.remove("blocked-card");
          titleEl.innerHTML = "Cadastro <span>Pendente de Aprovação</span>";
          msgEl.innerHTML = "Olá! Seu cadastro foi recebido com sucesso no ecossistema <strong>Fit Academy</strong>.";
          subEl.innerHTML = "Para garantir a segurança de todos os membros, seu acesso está aguardando a liberação por parte do coordenador técnico <strong>Nicolas</strong>.";
          badgeEl.innerHTML = "Status: Aguardando Liberação";

          alunoApprovedContent.classList.add("hidden");
          alunoPendingContent.classList.remove("hidden");
        }
      } catch (err) {
        console.error("Erro ao buscar perfil do aluno:", err);
        userDisplayName.textContent = user.email || "Aluno";
        alunoApprovedContent.classList.remove("hidden");
        alunoPendingContent.classList.add("hidden");
        startStudentRealtimeListener(user.uid);
      }

      dashboardSection.classList.remove("hidden");
      adminPanel.classList.add("hidden");
      alunoPanel.classList.remove("hidden");
    }
  } else {
    // Deslogado - Exibir Landing Page e ocultar Dashboard
    currentUser = null;
    currentRole = "aluno";
    
    loginForm.reset();
    loginError.classList.add("hidden");
    
    dashboardWrapper.classList.add("hidden");
    landingPageWrapper.classList.remove("hidden");
  }
  
  showPageLoader(false);
});

// SUBMIT DO FORMULÁRIO DE LOGIN
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  
  loginError.classList.add("hidden");
  btnLogin.disabled = true;
  btnLogin.querySelector("span").textContent = "Verificando...";

  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error("Falha ao entrar no portal:", error);
    let message = "Acesso negado. Por favor, tente novamente.";
    
    switch (error.code) {
      case "auth/invalid-email":
        message = "O e-mail digitado possui um formato incorreto.";
        break;
      case "auth/user-not-found":
      case "auth/wrong-password":
      case "auth/invalid-credential":
        message = "E-mail ou senha incorretos. Verifique suas credenciais.";
        break;
      case "auth/too-many-requests":
        message = "Muitas tentativas malsucedidas. Conta bloqueada temporariamente.";
        break;
    }
    
    loginError.textContent = message;
    loginError.classList.remove("hidden");
    btnLogin.disabled = false;
    btnLogin.querySelector("span").textContent = "Entrar no Portal";
  }
});

// SUBMIT DO FORMULÁRIO DE AUTO-CADASTRO (Matrícula direta pelo Portal)
formCadastro.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const nome = cadastroNome.value.trim();
  const email = cadastroEmail.value.trim();
  const password = cadastroPassword.value;
  
  cadastroError.classList.add("hidden");
  btnCadastro.disabled = true;
  btnCadastro.querySelector("span").textContent = "Enviando Solicitação...";

  try {
    // 1. Gravar solicitação na coleção separada 'permissoes'
    await addDoc(collection(db, "permissoes"), {
      nome: nome,
      email: email,
      senha: password, // Salvar a senha para o admin Nicolas criar a conta Auth na aprovação
      dataCadastro: new Date().toISOString()
    });

    alert("Sua solicitação de matrícula foi enviada com sucesso!\nO coordenador técnico Nicolas analisará seus dados e liberará o seu acesso em breve.");
    closeModal(modalCadastro);
  } catch (error) {
    console.error("Erro ao realizar matrícula:", error);
    let message = "Falha ao enviar solicitação de matrícula. Tente novamente.";
    
    cadastroError.textContent = message;
    cadastroError.classList.remove("hidden");
    btnCadastro.disabled = false;
    btnCadastro.querySelector("span").textContent = "Matricular-se";
  }
});

// LOGOUT
btnLogout.addEventListener("click", async () => {
  showPageLoader(true, "Desconectando com segurança...");
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Erro ao deslogar:", error);
    alert("Erro inesperado ao sair.");
  } finally {
    showPageLoader(false);
  }
});

// ==========================================================================
// FLUXO DO ALUNO (Visualizar Suas Aulas)
// ==========================================================================

function startStudentRealtimeListener(studentUid) {
  showPageLoader(true, "Carregando seus treinos...");
  
  const q = query(
    collection(db, "aulas"),
    where("alunoId", "==", studentUid)
  );

  unsubscribeAulas = onSnapshot(q, (snapshot) => {
    studentClassesGrid.innerHTML = "";
    
    if (snapshot.empty) {
      studentClassesGrid.innerHTML = `
        <div class="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width: 48px; height: 48px;">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <h3>Você não possui aulas ou treinos agendados</h3>
          <p>Solicite ao coordenador técnico Nicolas o agendamento de seus treinos.</p>
        </div>
      `;
      showPageLoader(false);
      return;
    }

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const card = document.createElement("div");
      card.className = "class-card";
      
      card.innerHTML = `
        <div class="class-card-header">
          <span class="class-tag">${data.sala || 'Sala Comum'}</span>
          <h3 class="class-name">${data.nome}</h3>
        </div>
        <div class="class-details">
          <div class="class-detail-item">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="width: 16px; height: 16px;">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>Professor: <strong class="class-detail-value">${data.instrutor}</strong></span>
          </div>
          <div class="class-detail-item">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="width: 16px; height: 16px;">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Horários: <strong class="class-detail-value">${formatarDataHora(data.horario)}</strong></span>
          </div>
        </div>
        <div class="class-student-owner">
          Fit Academy • Periodização Ativa
        </div>
      `;
      studentClassesGrid.appendChild(card);
    });
    
    showPageLoader(false);
  }, (error) => {
    console.error("Erro ao escutar aulas do aluno:", error);
    showPageLoader(false);
  });
}

// ==========================================================================
// FLUXO DO ADMINISTRADOR NICOLAS (Poder Total CRUD)
// ==========================================================================

// Helper reativo para atualizar a UI de alunos e permissões
function updatePermissionsAndAlunosUI() {
  // Combine all pending requests from 'permissoes' and blocked students from 'alunos'
  // 1. Pending registration requests from 'permissoes'
  const pendingRequests = globalSolicitacoes
    .filter(s => s.nome || s.email) // Filter out dummy documents that don't have registration data
    .map(s => ({
      id: s.id,
      nome: s.nome || "Cadastro Manual",
      email: s.email || "",
      senha: s.senha || "",
      dataCadastro: s.dataCadastro || new Date().toISOString(),
      aprovado: "pendente"
    }));

  // 2. Blocked or pending students in the official 'alunos' collection (like Google Sign-In registrations)
  const blockedOrPendingAlunos = globalAlunos.filter(a => a.aprovado === "proibido" || a.aprovado === "pendente");

  // Combine both
  globalPermissoes = [...pendingRequests, ...blockedOrPendingAlunos];

  // Sort globalPermissoes alphabetically A-Z by name
  globalPermissoes.sort((a, b) => a.nome.localeCompare(b.nome));

  // Update badge: pending requests from both 'permissoes' collection and pending 'alunos' count for the badge count
  const pendingCount = pendingRequests.length + globalAlunos.filter(a => a.aprovado === "pendente").length;
  if (pendingCount > 0) {
    badgePermissoesCount.textContent = pendingCount;
    badgePermissoesCount.classList.remove("hidden");
  } else {
    badgePermissoesCount.classList.add("hidden");
  }

  // Populate custom dropdown options for creating/editing classes (only approved/liberados can be chosen)
  populateCustomSelectOptions();

  // Render tables
  renderAlunosTable();
  renderPermissoesTable();
  renderAulasTable();
}

function startAdminRealtimeListeners() {
  // 1. Escutar Coleção de Alunos (Realtime Geral)
  unsubscribeAlunos = onSnapshot(collection(db, "alunos"), (snapshot) => {
    globalAlunos = [];
    
    snapshot.forEach((docSnap) => {
      globalAlunos.push({
        id: docSnap.id,
        ...docSnap.data()
      });
    });

    // Ordenar globalAlunos em ordem alfabética por nome de A a Z
    globalAlunos.sort((a, b) => a.nome.localeCompare(b.nome));

    // Atualizar UI combinada
    updatePermissionsAndAlunosUI();
  }, (error) => {
    console.error("Erro ao escutar alunos:", error);
  });

  // 2. Escutar Coleção de Solicitações (Realtime Geral)
  unsubscribePermissoes = onSnapshot(collection(db, "permissoes"), (snapshot) => {
    globalSolicitacoes = [];
    
    snapshot.forEach((docSnap) => {
      globalSolicitacoes.push({
        id: docSnap.id,
        ...docSnap.data()
      });
    });

    // Atualizar UI combinada
    updatePermissionsAndAlunosUI();
  }, (error) => {
    console.error("Erro ao escutar solicitações:", error);
  });

  // 3. Escutar Coleção de Aulas
  unsubscribeAulas = onSnapshot(collection(db, "aulas"), (snapshot) => {
    globalAulas = [];
    
    snapshot.forEach((docSnap) => {
      globalAulas.push({
        id: docSnap.id,
        ...docSnap.data()
      });
    });
    
    renderAulasTable();
  }, (error) => {
    console.error("Erro ao escutar aulas:", error);
  });
}


// Renderização e Filtro da Tabela de Alunos
function renderAlunosTable(filterText = "") {
  tableAlunosBody.innerHTML = "";
  
  const queryText = filterText.toLowerCase().trim();
  const filtered = globalAlunos.filter(a => 
    a.nome.toLowerCase().includes(queryText) || 
    a.email.toLowerCase().includes(queryText) ||
    a.id.toLowerCase().includes(queryText)
  );

  if (filtered.length === 0) {
    tableAlunosBody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; color: var(--text-secondary); padding: 40px 0;">
          Nenhum aluno encontrado.
        </td>
      </tr>
    `;
    return;
  }

  filtered.forEach(aluno => {
    const tr = document.createElement("tr");
    
    // Formatar data de cadastro se existir
    let dateStr = "-";
    if (aluno.dataCadastro) {
      const date = aluno.dataCadastro.toDate ? aluno.dataCadastro.toDate() : new Date(aluno.dataCadastro);
      dateStr = date.toLocaleDateString("pt-BR") + " " + date.toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' });
    }

    let statusBadge = "";
    if (aluno.aprovado === "liberado" || aluno.aprovado === true || aluno.aprovado === undefined) {
      statusBadge = '<span class="badge badge-success">Liberado</span>';
    } else if (aluno.aprovado === "proibido") {
      statusBadge = '<span class="badge badge-danger">Bloqueado</span>';
    } else if (aluno.aprovado === "pendente" || aluno.aprovado === false) {
      statusBadge = '<span class="badge badge-orange">Pendente</span>';
    }

    tr.innerHTML = `
      <td style="font-weight: 700; color: #fff;">${aluno.nome}</td>
      <td>${aluno.email}</td>
      <td style="font-family: monospace; font-size: 0.8rem; color: var(--pb-orange);">${aluno.id}</td>
      <td style="color: var(--text-muted);">${dateStr}</td>
      <td>${statusBadge}</td>
      <td>
        <div class="cell-actions">
          <button class="action-btn btn-edit-aluno" data-id="${aluno.id}" title="Editar Aluno">${editIcon}</button>
          <button class="action-btn btn-delete-action btn-delete-aluno" data-id="${aluno.id}" title="Deletar Aluno">${deleteIcon}</button>
        </div>
      </td>
    `;
    tableAlunosBody.appendChild(tr);
  });

  // Bind dos botões
  document.querySelectorAll(".btn-edit-aluno").forEach(btn => {
    btn.addEventListener("click", () => handleEditAluno(btn.dataset.id));
  });
  document.querySelectorAll(".btn-delete-aluno").forEach(btn => {
    btn.addEventListener("click", () => handleDeleteAluno(btn.dataset.id));
  });
}

// Renderização e Filtro da Tabela de Aulas
function renderAulasTable(filterText = "") {
  tableAulasBody.innerHTML = "";
  
  const queryText = filterText.toLowerCase().trim();
  const filtered = globalAulas.filter(a => 
    a.nome.toLowerCase().includes(queryText) || 
    (a.alunoNome && a.alunoNome.toLowerCase().includes(queryText)) ||
    a.instrutor.toLowerCase().includes(queryText) ||
    a.sala.toLowerCase().includes(queryText)
  );

  if (filtered.length === 0) {
    tableAulasBody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; color: var(--text-secondary); padding: 40px 0;">
          Nenhuma aula ou treino cadastrado.
        </td>
      </tr>
    `;
    return;
  }

  filtered.forEach(aula => {
    const tr = document.createElement("tr");
    
    // Buscar nome atualizado do aluno se houver divergência no cache
    const matchingAluno = globalAlunos.find(al => al.id === aula.alunoId);
    const alunoExibido = matchingAluno ? matchingAluno.nome : (aula.alunoNome || "Aluno Desconhecido");

    tr.innerHTML = `
      <td style="font-weight: 700; color: #fff;">${aula.nome}</td>
      <td style="color: var(--pb-orange); font-weight: 600;">${alunoExibido}</td>
      <td style="font-weight: 600;">${aula.instrutor}</td>
      <td><span class="badge badge-orange">${formatarDataHora(aula.horario)}</span></td>
      <td><span class="badge badge-gray">${aula.sala}</span></td>
      <td>
        <div class="cell-actions">
          <button class="action-btn btn-edit-aula" data-id="${aula.id}" title="Editar Aula">${editIcon}</button>
          <button class="action-btn btn-delete-action btn-delete-aula" data-id="${aula.id}" title="Deletar Aula">${deleteIcon}</button>
        </div>
      </td>
    `;
    tableAulasBody.appendChild(tr);
  });

  // Bind de cliques
  document.querySelectorAll(".btn-edit-aula").forEach(btn => {
    btn.addEventListener("click", () => handleEditAula(btn.dataset.id));
  });
  document.querySelectorAll(".btn-delete-aula").forEach(btn => {
    btn.addEventListener("click", () => handleDeleteAula(btn.dataset.id));
  });
}

// Dropdown Customizado de Seleção de Alunos (Ordem Alfabética de A a Z + Autocompletar por Digitação)
function populateCustomSelectOptions(filterText = "") {
  aulaAlunoOptions.innerHTML = "";
  
  const queryText = filterText.toLowerCase().trim();
  const filtered = globalAlunos.filter(aluno => 
    (aluno.aprovado === "liberado" || aluno.aprovado === true || aluno.aprovado === undefined) &&
    (aluno.nome.toLowerCase().includes(queryText) || aluno.email.toLowerCase().includes(queryText))
  );

  if (filtered.length === 0) {
    const div = document.createElement("div");
    div.className = "custom-select-option no-results";
    div.textContent = "Nenhum aluno encontrado";
    aulaAlunoOptions.appendChild(div);
    return;
  }

  filtered.forEach(aluno => {
    const div = document.createElement("div");
    div.className = "custom-select-option";
    div.dataset.id = aluno.id;
    div.dataset.nome = aluno.nome;
    div.textContent = `${aluno.nome} (${aluno.email})`;
    
    div.addEventListener("click", () => {
      aulaAlunoSelect.value = aluno.id;
      aulaAlunoSearch.value = aluno.nome;
      aulaAlunoOptions.classList.add("hidden");
    });
    
    aulaAlunoOptions.appendChild(div);
  });
}

// Renderização e Filtro da Tabela de Permissões
function renderPermissoesTable(filterText = "") {
  tablePermissoesBody.innerHTML = "";
  
  const queryText = filterText.toLowerCase().trim();
  const filtered = globalPermissoes.filter(p => 
    p.nome.toLowerCase().includes(queryText) || 
    p.email.toLowerCase().includes(queryText) ||
    p.id.toLowerCase().includes(queryText)
  );

  if (filtered.length === 0) {
    tablePermissoesBody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; color: var(--text-secondary); padding: 40px 0;">
          Nenhuma solicitação de cadastro pendente ou bloqueada encontrada.
        </td>
      </tr>
    `;
    return;
  }

  filtered.forEach(solicitacao => {
    const tr = document.createElement("tr");
    
    let dateStr = "-";
    if (solicitacao.dataCadastro) {
      const date = new Date(solicitacao.dataCadastro);
      dateStr = date.toLocaleDateString("pt-BR") + " " + date.toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' });
    }

    let statusBadge = "";
    let actionButtons = "";
    if (solicitacao.aprovado === "proibido") {
      statusBadge = '<span class="badge badge-danger">Bloqueado</span>';
      actionButtons = `
        <button class="btn btn-orange btn-small btn-approve-student" data-id="${solicitacao.id}" style="padding: 6px 12px; font-size: 0.7rem; font-weight: 800; min-width: auto; height: auto; width: auto; display: inline-flex;">
          Liberar Acesso
        </button>
      `;
    } else {
      statusBadge = '<span class="badge badge-orange">Pendente</span>';
      actionButtons = `
        <button class="btn btn-orange btn-small btn-approve-student" data-id="${solicitacao.id}" style="padding: 6px 12px; font-size: 0.7rem; font-weight: 800; min-width: auto; height: auto; width: auto; display: inline-flex; margin-right: 8px;">
          Liberar Acesso
        </button>
        <button class="btn btn-danger btn-small btn-reject-student" data-id="${solicitacao.id}" style="padding: 6px 12px; font-size: 0.7rem; font-weight: 800; min-width: auto; height: auto; width: auto; display: inline-flex;">
          Negar / Excluir
        </button>
      `;
    }

    const uidDisplay = solicitacao.senha ? '<span style="color: var(--text-muted); font-style: italic;">Aguardando Criação</span>' : solicitacao.id;

    tr.innerHTML = `
      <td style="font-weight: 700; color: #fff;">${solicitacao.nome}</td>
      <td>${solicitacao.email}</td>
      <td style="font-family: monospace; font-size: 0.8rem; color: var(--pb-orange);">${uidDisplay}</td>
      <td style="color: var(--text-muted);">${dateStr}</td>
      <td>${statusBadge}</td>
      <td>
        <div class="cell-actions" style="justify-content: center;">
          ${actionButtons}
        </div>
      </td>
    `;
    tablePermissoesBody.appendChild(tr);
  });

  // Vincular eventos de cliques
  document.querySelectorAll(".btn-approve-student").forEach(btn => {
    btn.addEventListener("click", () => handleApproveStudent(btn.dataset.id));
  });
  document.querySelectorAll(".btn-reject-student").forEach(btn => {
    btn.addEventListener("click", () => handleRejectStudent(btn.dataset.id));
  });
}

// Ações de Aprovação / Bloqueio de Alunos
async function handleApproveStudent(studentId) {
  const solicitacao = globalPermissoes.find(p => p.id === studentId);
  if (!solicitacao) return;

  showPageLoader(true, "Finalizando cadastro e liberando acesso...");
  try {
    if (solicitacao.senha) {
      // 1. É uma nova solicitação pendente de auto-cadastro da coleção 'permissoes'
      // Criar a conta de login no Firebase Auth em segundo plano
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, solicitacao.email, solicitacao.senha);
      const newUid = userCredential.user.uid;

      // Deslogar o usuário temporário do app secundário imediatamente para manter Nicolas ativo
      await signOut(secondaryAuth);

      // Salvar os dados completos na coleção 'alunos' do Firestore indexado pelo UID definitivo
      await setDoc(doc(db, "alunos", newUid), {
        nome: solicitacao.nome,
        email: solicitacao.email,
        aprovado: "liberado",
        dataCadastro: solicitacao.dataCadastro || new Date().toISOString()
      });

      // Deletar o documento temporário da coleção 'permissoes'
      await deleteDoc(doc(db, "permissoes", studentId));

      alert(`O cadastro de "${solicitacao.nome}" foi FINALIZADO e LIBERADO com sucesso!\nSua conta do Firebase Auth foi criada e o acesso já está ativo.`);
    } else {
      // 2. É um aluno já registrado que estava com status 'proibido' (bloqueado)
      await updateDoc(doc(db, "alunos", studentId), {
        aprovado: "liberado"
      });
      alert(`O acesso do aluno "${solicitacao.nome}" foi liberado com sucesso!`);
    }
  } catch (error) {
    console.error("Erro ao aprovar aluno:", error);
    let friendlyMessage = "Erro ao finalizar o cadastro do aluno.";
    if (error.code === "auth/email-already-in-use") {
      friendlyMessage = "Esse e-mail já está cadastrado por outro usuário no Firebase Auth!";
    } else if (error.code === "auth/invalid-email") {
      friendlyMessage = "O formato de e-mail é inválido.";
    } else if (error.code === "auth/weak-password") {
      friendlyMessage = "A senha da solicitação é muito fraca.";
    }
    alert(friendlyMessage);
  } finally {
    showPageLoader(false);
  }
}

async function handleRejectStudent(studentId) {
  const solicitacao = globalPermissoes.find(p => p.id === studentId);
  if (!solicitacao) return;

  if (solicitacao.senha) {
    // Nova solicitação de cadastro vinda de 'permissoes'
    const confirmar = confirm(`Atenção Nicolas:\nDeseja mesmo NEGAR e EXCLUIR permanentemente a solicitação de matrícula de "${solicitacao.nome}"?\n\nIsso apagará a solicitação e nenhuma conta no Firebase Auth será criada.`);
    if (!confirmar) return;

    showPageLoader(true, "Negando e excluindo solicitação...");
    try {
      await deleteDoc(doc(db, "permissoes", studentId));
      alert(`A solicitação de "${solicitacao.nome}" foi negada e excluída com sucesso!`);
    } catch (error) {
      console.error("Erro ao excluir solicitação:", error);
      alert("Erro ao negar solicitação de matrícula.");
    } finally {
      showPageLoader(false);
    }
  } else {
    // Aluno já cadastrado no banco de alunos (caso chame de outra parte)
    const confirmar = confirm(`Atenção Nicolas:\nDeseja mesmo suspender/proibir o acesso do aluno "${solicitacao.nome}"?\n\nO aluno continuará cadastrado no banco de dados, mas não poderá acessar o painel de treinos.`);
    if (!confirmar) return;

    showPageLoader(true, "Suspendendo acesso do aluno...");
    try {
      await updateDoc(doc(db, "alunos", studentId), {
        aprovado: "proibido"
      });
      alert(`O acesso do aluno "${solicitacao.nome}" foi suspenso/proibido com sucesso.\nEle continuará na lista de permissões caso você queira liberá-lo no futuro.`);
    } catch (error) {
      console.error("Erro ao suspender aluno:", error);
      alert("Erro ao suspender o acesso do aluno.");
    } finally {
      showPageLoader(false);
    }
  }
}


// BUSCA DE ALUNOS, AULAS E PERMISSÕES
searchAlunos.addEventListener("input", (e) => renderAlunosTable(e.target.value));
searchAulas.addEventListener("input", (e) => renderAulasTable(e.target.value));
searchPermissoes.addEventListener("input", (e) => renderPermissoesTable(e.target.value));

// ABAS DE NAVEGAÇÃO
tabAulas.addEventListener("click", () => switchAdminTab("aulas"));
tabAlunos.addEventListener("click", () => switchAdminTab("alunos"));
tabPermissoes.addEventListener("click", () => switchAdminTab("permissoes"));


// ==========================================================================
// CRUD ALUNOS (Nicolas Power)
// ==========================================================================

btnAddAluno.addEventListener("click", () => {
  alunoIdInput.value = "";
  modalAlunoTitle.innerHTML = "Cadastrar <span>Novo Aluno</span>";
  alunoUidInput.disabled = false;
  openModal(modalAluno);
});

async function handleEditAluno(alunoId) {
  const aluno = globalAlunos.find(a => a.id === alunoId);
  if (!aluno) return;

  alunoIdInput.value = aluno.id;
  alunoNomeInput.value = aluno.nome;
  alunoEmailInput.value = aluno.email;
  
  alunoUidInput.value = aluno.id;
  alunoUidInput.disabled = true;

  modalAlunoTitle.innerHTML = "Editar <span>Cadastro do Aluno</span>";
  openModal(modalAluno);
}

formAluno.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = alunoIdInput.value.trim();
  const nome = alunoNomeInput.value.trim();
  const email = alunoEmailInput.value.trim();

  showPageLoader(true, id ? "Salvando dados do aluno..." : "Criando conta de acesso no Firebase...");

  try {
    if (id) {
      // Editar existente (apenas nome e e-mail no perfil)
      await updateDoc(doc(db, "alunos", id), {
        nome: nome,
        email: email
      });

      // Atualizar também o alunoNome nas aulas desse aluno em lote reativo
      const q = query(collection(db, "aulas"), where("alunoId", "==", id));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(async (aulaDoc) => {
        await updateDoc(doc(db, "aulas", aulaDoc.id), {
          alunoNome: nome
        });
      });
    } else {
      // Criar a conta de login no Firebase Auth em segundo plano com senha padrão "123456"
      const defaultPass = "123456";
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, defaultPass);
      const newUid = userCredential.user.uid;

      // Deslogar o usuário temporário do app secundário imediatamente para manter Nicolas ativo
      await signOut(secondaryAuth);

      // Salvar os dados completos na coleção 'alunos' do Firestore indexado pelo UID
      await setDoc(doc(db, "alunos", newUid), {
        nome: nome,
        email: email,
        aprovado: "liberado",
        dataCadastro: new Date().toISOString()
      });


      alert(`Aluno cadastrado com sucesso no Firebase Auth!\nE-mail: ${email}\nSenha padrão gerada: ${defaultPass}\n\nNicolas, o aluno já pode fazer login na recepção.`);
    }

    closeModal(modalAluno);
  } catch (error) {
    console.error("Erro ao salvar aluno no banco:", error);
    let friendlyMessage = "Falha ao registrar aluno. Verifique os dados.";
    
    if (error.code === "auth/email-already-in-use") {
      friendlyMessage = "Esse e-mail já está em uso por outro aluno no Firebase Auth!";
    } else if (error.code === "auth/invalid-email") {
      friendlyMessage = "O formato de e-mail inserido é inválido.";
    } else if (error.code === "auth/weak-password") {
      friendlyMessage = "A senha gerada é muito fraca para os requisitos do Firebase.";
    }
    
    alert(friendlyMessage);
  } finally {
    showPageLoader(false);
  }
});

async function handleDeleteAluno(alunoId) {
  const aluno = globalAlunos.find(a => a.id === alunoId);
  if (!aluno) return;

  const confirmar = confirm(`Atenção Nicolas:\nDeseja mesmo remover permanentemente o aluno "${aluno.nome}"?\n\nIsso NÃO remove as credenciais dele no Auth, apenas remove seus dados de perfil e treinos.`);
  if (!confirmar) return;

  showPageLoader(true, "Removendo aluno...");
  try {
    // 1. Remover perfil do aluno
    await deleteDoc(doc(db, "alunos", alunoId));

    // 2. Remover aulas vinculadas a este aluno
    const vinculadas = globalAulas.filter(au => au.alunoId === alunoId);
    for (const aula of vinculadas) {
      await deleteDoc(doc(db, "aulas", aula.id));
    }
  } catch (error) {
    console.error("Erro ao deletar aluno:", error);
    alert("Erro ao remover aluno do banco.");
  } finally {
    showPageLoader(false);
  }
}

// ==========================================================================
// CRUD AULAS (Nicolas Power)
// ==========================================================================

btnAddAula.addEventListener("click", () => {
  if (globalAlunos.length === 0) {
    alert("Nicolas, você precisa ter pelo menos um aluno cadastrado no sistema antes de criar uma aula!");
    return;
  }
  aulaIdInput.value = "";
  aulaAlunoSearch.value = "";
  aulaAlunoSelect.value = "";
  modalAulaTitle.innerHTML = "Criar <span>Nova Aula / Treino</span>";
  openModal(modalAula);
});

async function handleEditAula(aulaId) {
  const aula = globalAulas.find(a => a.id === aulaId);
  if (!aula) return;

  aulaIdInput.value = aula.id;
  aulaNomeInput.value = aula.nome;
  aulaAlunoSelect.value = aula.alunoId;
  aulaAlunoSearch.value = aula.alunoNome || "";
  aulaInstrutorSelect.value = aula.instrutor;
  aulaHorarioInput.value = aula.horario;
  aulaSalaInput.value = aula.sala;

  modalAulaTitle.innerHTML = "Editar <span>Aula / Treino</span>";
  openModal(modalAula);
}

/**
 * Verifica se já existe uma aula agendada para o mesmo instrutor no mesmo dia e horário
 * @param {string} horario - O horário a ser verificado (formato datetime-local string)
 * @param {string} instrutor - O instrutor a ser verificado
 * @param {string} excludeId - O ID da aula a ser desconsiderada (no caso de edição)
 * @returns {boolean} - Retorna true se houver conflito
 */
function verificarConflitoHorario(horario, instrutor, excludeId = "") {
  const normalizedHorario = horario.trim().toLowerCase();
  const normalizedInstrutor = instrutor.trim().toLowerCase();
  return globalAulas.some(aula => {
    if (excludeId && aula.id === excludeId) return false;
    return aula.horario.trim().toLowerCase() === normalizedHorario &&
           aula.instrutor.trim().toLowerCase() === normalizedInstrutor;
  });
}

formAula.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = aulaIdInput.value.trim();
  const nome = aulaNomeInput.value;
  const alunoId = aulaAlunoSelect.value;
  const instrutor = aulaInstrutorSelect.value;
  const horario = aulaHorarioInput.value;
  const sala = aulaSalaInput.value.trim();

  // Validação de conflito de dia, horário e instrutor
  if (verificarConflitoHorario(horario, instrutor, id)) {
    alert("horario reservado já");
    return;
  }

  // Obter o nome do aluno selecionado
  const selectedAluno = globalAlunos.find(al => al.id === alunoId);
  const alunoNome = selectedAluno ? selectedAluno.nome : "Aluno Desconhecido";

  showPageLoader(true, "Salvando aula...");

  const aulaData = {
    nome: nome,
    alunoId: alunoId,
    alunoNome: alunoNome,
    instrutor: instrutor,
    horario: horario,
    sala: sala
  };

  try {
    if (id) {
      // Atualizar aula existente
      await updateDoc(doc(db, "aulas", id), aulaData);
    } else {
      // Adicionar nova aula
      await addDoc(collection(db, "aulas"), aulaData);
    }

    closeModal(modalAula);
  } catch (error) {
    console.error("Erro ao salvar aula:", error);
    alert("Falha ao salvar aula. Verifique se preencheu todos os campos corretos.");
  } finally {
    showPageLoader(false);
  }
});

async function handleDeleteAula(aulaId) {
  const aula = globalAulas.find(a => a.id === aulaId);
  if (!aula) return;

  const confirmar = confirm(`Nicolas, deseja mesmo excluir permanentemente o treino/aula "${aula.nome}" vinculada ao aluno "${aula.alunoNome}"?`);
  if (!confirmar) return;

  showPageLoader(true, "Excluindo aula...");
  try {
    await deleteDoc(doc(db, "aulas", aulaId));
  } catch (error) {
    console.error("Erro ao excluir aula:", error);
    alert("Erro ao excluir aula do banco.");
  } finally {
    showPageLoader(false);
  }
}

// ==========================================================================
// GATILHOS DE ABERTURA DE MODAIS (LANDING PAGE)
// ==========================================================================

btnNavAluno.addEventListener("click", () => {
  loginSelectedRole = "aluno";
  tabLoginAluno.classList.add("active");
  tabLoginAdmin.classList.remove("active");
  loginError.classList.add("hidden");
  openModal(modalLogin);
});

btnNavAdmin.addEventListener("click", () => {
  loginSelectedRole = "admin";
  tabLoginAdmin.classList.add("active");
  tabLoginAluno.classList.remove("active");
  loginError.classList.add("hidden");
  openModal(modalLogin);
});

btnNavCadastrar.addEventListener("click", () => {
  cadastroError.classList.add("hidden");
  openModal(modalCadastro);
});

btnHeroMatricula.addEventListener("click", () => {
  cadastroError.classList.add("hidden");
  openModal(modalCadastro);
});

// Alternar abas dentro do login modal
tabLoginAluno.addEventListener("click", () => {
  loginSelectedRole = "aluno";
  tabLoginAluno.classList.add("active");
  tabLoginAdmin.classList.remove("active");
});

tabLoginAdmin.addEventListener("click", () => {
  loginSelectedRole = "admin";
  tabLoginAdmin.classList.add("active");
  tabLoginAluno.classList.remove("active");
});

// Fechar com Logo click
logoHome.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ==========================================================================
// BIND DE CLIQUE DOS MODAIS (FECHAMENTO)
// ==========================================================================

btnCloseModalLogin.addEventListener("click", () => closeModal(modalLogin));
btnCloseModalCadastro.addEventListener("click", () => closeModal(modalCadastro));

btnCloseModalAula.addEventListener("click", () => closeModal(modalAula));
btnCancelarAula.addEventListener("click", () => closeModal(modalAula));

btnCloseModalAluno.addEventListener("click", () => closeModal(modalAluno));
btnCancelarAluno.addEventListener("click", () => closeModal(modalAluno));

// ==========================================================================
// EVENTOS ADICIONAIS DO DROPDOWN CUSTOMIZADO
// ==========================================================================

// Abrir opções ao focar no campo de busca do autocomplete
aulaAlunoSearch.addEventListener("focus", () => {
  populateCustomSelectOptions(aulaAlunoSearch.value);
  aulaAlunoOptions.classList.remove("hidden");
});

// Filtrar opções em tempo real ao digitar
aulaAlunoSearch.addEventListener("input", (e) => {
  populateCustomSelectOptions(e.target.value);
  aulaAlunoOptions.classList.remove("hidden");
});

// Fechar modal ou dropdown clicando fora deles
window.addEventListener("click", (e) => {
  if (e.target === modalAula) closeModal(modalAula);
  if (e.target === modalAluno) closeModal(modalAluno);
  if (e.target === modalLogin) closeModal(modalLogin);
  if (e.target === modalCadastro) closeModal(modalCadastro);
  
  // Fechar dropdown customizado se clicar fora do wrapper
  if (!e.target.closest("#aula-aluno-wrapper")) {
    aulaAlunoOptions.classList.add("hidden");
  }
});

// Ação de Login/Matrícula via Google Sign-In
async function handleGoogleSignIn() {
  showPageLoader(true, "Conectando com o Google...");
  try {
    await signInWithPopup(auth, googleProvider);
    // onAuthStateChanged cuidará de criar o perfil pendente reativamente ou logar se já existir!
    closeModal(modalLogin);
    closeModal(modalCadastro);
  } catch (error) {
    console.error("Erro ao autenticar com o Google:", error);
    let friendlyMsg = "Falha ao conectar com o Google. Tente novamente.";
    if (error.code === "auth/popup-closed-by-user") {
      friendlyMsg = "A janela de login do Google foi fechada antes de concluir.";
    } else if (error.code === "auth/blocked-by-popup-trigger") {
      friendlyMsg = "O navegador bloqueou a janela pop-up de login do Google.";
    }
    alert(friendlyMsg);
  } finally {
    showPageLoader(false);
  }
}

btnLoginGoogle.addEventListener("click", handleGoogleSignIn);
btnCadastroGoogle.addEventListener("click", handleGoogleSignIn);

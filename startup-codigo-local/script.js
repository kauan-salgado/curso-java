/* =========================================================
   CÓDIGO LOCAL: JavaScript do site
   Este arquivo é carregado no fim do <body>, depois do
   Bootstrap, então todos os elementos da página já existem.
   ========================================================= */

/* ---------------------------------------------------------
   0. CONFIGURAÇÃO
   TROQUE pelo seu número com código do país (55) e DDD,
   só números. Exemplo: 5561999998888
   --------------------------------------------------------- */
const NUMERO_WHATSAPP = '5561996251146';

// Monta o link do WhatsApp já com a mensagem escrita.
// encodeURIComponent troca espaços e acentos por códigos que funcionam em URL.
function linkWhatsApp(mensagem) {
    return `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(mensagem)}`;
}

// Botão "WhatsApp" da seção de contato (assim o número fica num lugar só)
document.getElementById('link-whatsapp').href =
    linkWhatsApp('Olá, Código Local! Quero saber mais sobre um site para o meu negócio.');


/* ---------------------------------------------------------
   1. ANO AUTOMÁTICO NO RODAPÉ
   --------------------------------------------------------- */
document.getElementById('ano-atual').textContent = new Date().getFullYear();


/* ---------------------------------------------------------
   2. MODO CLARO / ESCURO
   O Bootstrap 5.3 troca as cores sozinho quando mudamos o
   atributo data-bs-theme do <html>. Guardamos a escolha no
   localStorage para lembrar na próxima visita.
   --------------------------------------------------------- */
const botaoTema = document.getElementById('botao-tema');

function aplicarTema(tema) {
    document.documentElement.setAttribute('data-bs-theme', tema);

    // O texto do botão mostra para qual tema ele VAI mudar
    if (tema === 'dark') {
        botaoTema.textContent = '☀️ Claro';
        botaoTema.setAttribute('aria-label', 'Ativar modo claro');
    } else {
        botaoTema.textContent = '🌙 Escuro';
        botaoTema.setAttribute('aria-label', 'Ativar modo escuro');
    }
}

botaoTema.addEventListener('click', () => {
    const temaAtual = document.documentElement.getAttribute('data-bs-theme');
    const novoTema = temaAtual === 'dark' ? 'light' : 'dark';
    aplicarTema(novoTema);

    try {
        localStorage.setItem('tema', novoTema);
    } catch (erro) {
        // Navegador bloqueou o localStorage: o tema muda, só não fica salvo
    }
});

// Ao abrir a página, o botão já mostra o texto certo para o tema salvo
aplicarTema(document.documentElement.getAttribute('data-bs-theme'));


/* ---------------------------------------------------------
   3. MENU NO CELULAR: fecha sozinho ao clicar num link
   Sem isso, o menu "hambúrguer" continuaria aberto
   cobrindo a seção para onde o visitante foi.
   --------------------------------------------------------- */
const menu = document.getElementById('menu-principal');
const menuCollapse = bootstrap.Collapse.getOrCreateInstance(menu, { toggle: false });

document.querySelectorAll('#menu-principal .nav-link').forEach((link) => {
    link.addEventListener('click', () => {
        if (menu.classList.contains('show')) {
            menuCollapse.hide();
        }
    });
});


/* ---------------------------------------------------------
   4. PLANOS + MODAL DO BOOTSTRAP
   Ao clicar em "Escolher Básico/Completo", lemos os dados
   data-plano e data-preco do botão e abrimos o modal.
   --------------------------------------------------------- */
const modalPlano = new bootstrap.Modal(document.getElementById('modal-plano'));
const modalNome = document.getElementById('modal-plano-nome');
const modalPreco = document.getElementById('modal-plano-preco');
const modalWhatsApp = document.getElementById('modal-whatsapp');
const modalIrFormulario = document.getElementById('modal-ir-formulario');

let planoEscolhido = '';

document.querySelectorAll('.botao-plano').forEach((botao) => {
    botao.addEventListener('click', () => {
        // Desestruturação: pega plano e preco de dentro de botao.dataset
        const { plano, preco } = botao.dataset;
        planoEscolhido = plano;

        modalNome.textContent = plano;
        modalPreco.textContent = preco;
        modalWhatsApp.href = linkWhatsApp(
            `Olá, Código Local! Tenho interesse no plano ${plano} (R$ ${preco}/mês).`
        );

        modalPlano.show();
    });
});

// Lembra se o modal foi fechado pelo botão "Preencher formulário"
let irParaFormulario = false;

// "Preencher formulário": já deixa o plano marcado no select e fecha o modal
modalIrFormulario.addEventListener('click', () => {
    document.getElementById('campo-plano').value = planoEscolhido;
    irParaFormulario = true;
    modalPlano.hide();
});

// 'hidden.bs.modal' é um evento do Bootstrap: dispara quando o modal TERMINOU de fechar.
// Só então rolamos até o formulário (antes disso o modal ainda bloqueia a página).
document.getElementById('modal-plano').addEventListener('hidden.bs.modal', () => {
    if (!irParaFormulario) return;
    irParaFormulario = false;

    document.getElementById('contato').scrollIntoView({ behavior: 'smooth' });
    document.getElementById('campo-nome').focus({ preventScroll: true });
});


/* ---------------------------------------------------------
   5. FORMULÁRIO DE CONTATO
   - e.preventDefault() impede a página de recarregar
   - validamos os campos e marcamos com .is-invalid / .is-valid
   - se estiver tudo certo, abrimos o WhatsApp com a mensagem
   --------------------------------------------------------- */
const formulario = document.getElementById('formulario-contato');
const areaAlerta = document.getElementById('formulario-alerta');
const campoNome = document.getElementById('campo-nome');
const campoNegocio = document.getElementById('campo-negocio');
const campoPlano = document.getElementById('campo-plano');
const campoMensagem = document.getElementById('campo-mensagem');

// Mostra um alerta do Bootstrap (tipo: 'success', 'danger', 'warning'...)
// Criamos os elementos com createElement e usamos textContent (e não innerHTML)
// para que o texto digitado pelo visitante nunca seja lido como código HTML.
function mostrarAlerta(tipo, texto) {
    const alerta = document.createElement('div');
    alerta.className = `alert alert-${tipo} alert-dismissible fade show`;
    alerta.setAttribute('role', 'alert');
    alerta.textContent = texto;

    const botaoFechar = document.createElement('button');
    botaoFechar.type = 'button';
    botaoFechar.className = 'btn-close';
    botaoFechar.setAttribute('data-bs-dismiss', 'alert');
    botaoFechar.setAttribute('aria-label', 'Fechar');
    alerta.appendChild(botaoFechar);

    areaAlerta.replaceChildren(alerta); // troca o alerta antigo pelo novo
}

// Marca um campo como válido ou inválido (classes do Bootstrap)
function marcarCampo(campo, valido) {
    campo.classList.toggle('is-invalid', !valido);
    campo.classList.toggle('is-valid', valido);
}

formulario.addEventListener('submit', (evento) => {
    evento.preventDefault();

    const nome = campoNome.value.trim();
    const negocio = campoNegocio.value;
    const plano = campoPlano.value;
    const mensagem = campoMensagem.value.trim();

    const nomeValido = nome.length >= 2;
    const negocioValido = negocio !== '';

    marcarCampo(campoNome, nomeValido);
    marcarCampo(campoNegocio, negocioValido);

    if (!nomeValido || !negocioValido) {
        mostrarAlerta('danger', 'Confira os campos destacados em vermelho.');
        // Coloca o cursor no primeiro campo com erro
        (nomeValido ? campoNegocio : campoNome).focus();
        return;
    }

    // Monta o texto da mensagem, uma linha por informação
    let texto = `Olá, Código Local! Meu nome é ${nome} e tenho ${negocio}.`;
    texto += plano ? `\nTenho interesse no plano ${plano}.` : '\nAinda não escolhi um plano.';
    if (mensagem) {
        texto += `\n${mensagem}`;
    }

    window.open(linkWhatsApp(texto), '_blank', 'noopener');

    mostrarAlerta('success', `Obrigado, ${nome}! Abrimos o WhatsApp com a sua mensagem pronta. É só enviar.`);
    formulario.reset();
    [campoNome, campoNegocio].forEach((campo) => campo.classList.remove('is-valid'));
});

// Enquanto a pessoa corrige, o vermelho some assim que o campo fica certo
campoNome.addEventListener('input', () => {
    if (campoNome.classList.contains('is-invalid')) marcarCampo(campoNome, campoNome.value.trim().length >= 2);
});
campoNegocio.addEventListener('change', () => {
    marcarCampo(campoNegocio, campoNegocio.value !== '');
});

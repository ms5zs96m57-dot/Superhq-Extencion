new Extension({
    name: 'Super HQ',
    icon: 'https://www.superhq.net/wp-content/uploads/2022/04/cropped-gibi-hq-comics-superhq-logo-circle.png',
    version: '1.0.0',
    lang: 'pt',
    domains: ['www.superhq.net', 'superhq.net'],

    // Home - listas
    async latest() {
        const html = await this.http.get('https://www.superhq.net/hq/', { responseType: 'text' });
        const parser = this.dom(html);

        // Seleciona todos os cards de HQ
        const cards = parser.querySelectorAll('.page-title + .loop-content .thumb');
        // Cada ".thumb" contém o link para a HQ, imagem e nome
        return Array.from(cards).map(card => ({
            title: card.querySelector('img')?.getAttribute('title')?.trim() || 'Sem título',
            url: card.querySelector('a')?.getAttribute('href'),
            cover: card.querySelector('img')?.getAttribute('src')
        }));
    },

    // Pesquisa
    async search(query) {
        const searchUrl = `https://www.superhq.net/?s=${encodeURIComponent(query)}`;
        const html = await this.http.get(searchUrl, { responseType: 'text' });
        const parser = this.dom(html);
        const cards = parser.querySelectorAll('.page-title + .loop-content .thumb');
        return Array.from(cards).map(card => ({
            title: card.querySelector('img')?.getAttribute('title')?.trim() || 'Sem título',
            url: card.querySelector('a')?.getAttribute('href'),
            cover: card.querySelector('img')?.getAttribute('src')
        }));
    },

    // Detalhes (informações, lista de capítulos)
    async info(url) {
        const html = await this.http.get(url, { responseType: 'text' });
        const parser = this.dom(html);

        // Sinopse
        const desc = parser.querySelector('.content')?.innerText?.trim() || '';

        // Capa
        const cover = parser.querySelector('.thumb img')?.getAttribute('src');

        // Capítulos
        const chapters = Array.from(parser.querySelectorAll('.capitulos ul li')).map(node => ({
            title: node.innerText.trim(),
            url: node.querySelector('a')?.getAttribute('href'),
        }));

        return {
            title: parser.querySelector('.post-title')?.innerText?.trim() || 'Sem título',
            desc,
            cover,
            chapters: chapters.reverse() // inverter para ordem crescente se necessário
        };
    },

    // Páginas (lista de URLs das imagens de cada página)
    async chapter(url) {
        const html = await this.http.get(url, { responseType: 'text' });
        const parser = this.dom(html);

        // As páginas geralmente aparecem dentro do ".pag .wp-manga-chapter-img img"
        // Adaptei para SuperHQ:
        const imgs = parser.querySelectorAll('.pag img, .paginas img, .wp-block-image img');
        return Array.from(imgs).map(img => img.getAttribute('src'));
    },
});

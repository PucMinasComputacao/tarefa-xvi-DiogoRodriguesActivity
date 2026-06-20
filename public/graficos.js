const DB_URL = 'http://localhost:3000/catalogo';
 
    Chart.defaults.color = '#aaa';
    Chart.defaults.borderColor = '#2a2a2a';
 
    function buildBarChart(canvasId, labels, data, colors, maxNote = 10) {
      const ctx = document.getElementById(canvasId).getContext('2d');
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'Nota',
            data,
            backgroundColor: colors,
            borderColor: colors,
            borderWidth: 1,
            borderRadius: 4,
          }]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: ctx => ` Nota: ${ctx.parsed.x.toFixed(1)}`
              }
            }
          },
          scales: {
            x: {
              min: 6,
              max: maxNote,
              ticks: { stepSize: 0.5 },
              grid: { color: '#2a2a2a' }
            },
            y: {
              grid: { color: '#2a2a2a' }
            }
          }
        }
      });
    }
 
    async function init() {
      let catalogo;
 
      try {
        const res = await fetch(DB_URL);
        catalogo = await res.json();
      } catch (e) {
        // JSON Server offline — usa os dados embutidos como fallback
        catalogo = [
          { titulo: 'Tropa de Elite', nota: 8.6, tipo: 'filme' },
          { titulo: 'Como Treinar o Seu Dragão', nota: 8.1, tipo: 'filme' },
          { titulo: 'Karatê Kid', nota: 7.3, tipo: 'filme' },
          { titulo: 'Clube da Luta', nota: 8.8, tipo: 'filme' },
          { titulo: 'Emergência Radioativa', nota: 9.4, tipo: 'serie' },
          { titulo: 'Breaking Bad', nota: 9.5, tipo: 'serie' },
          { titulo: 'The Boys', nota: 8.7, tipo: 'serie' },
          { titulo: 'Invencível', nota: 8.9, tipo: 'serie' },
          { titulo: 'Cena de Fuga — Invencível', nota: 8.5, tipo: 'serie' },
          { titulo: 'Favela do Turano — Tropa de Elite', nota: 8.6, tipo: 'filme' }
        ];
      }
 
      // Ordena do maior para o menor
      const ordenado = [...catalogo].sort((a, b) => b.nota - a.nota);
 
      const filmes = ordenado.filter(i => i.tipo === 'filme');
      const series = ordenado.filter(i => i.tipo === 'serie');
 
      const cor = item => item.tipo === 'filme' ? '#e8b14b' : '#7cb9e8';
 
      // Gráfico geral
      buildBarChart(
        'chartGeral',
        ordenado.map(i => i.titulo),
        ordenado.map(i => i.nota),
        ordenado.map(cor)
      );
 
      // Gráfico filmes
      buildBarChart(
        'chartFilmes',
        filmes.map(i => i.titulo),
        filmes.map(i => i.nota),
        filmes.map(() => '#e8b14b')
      );
 
      // Gráfico séries
      buildBarChart(
        'chartSeries',
        series.map(i => i.titulo),
        series.map(i => i.nota),
        series.map(() => '#7cb9e8')
      );
    }
 
    init();
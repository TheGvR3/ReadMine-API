//Vista per ottenere tutte le opere con autori e generi aggregati

CREATE OR REPLACE VIEW get_all_opere_view AS
SELECT 
    o.id_opera,
    o.titolo,
    o.id_serie,
    o.tipo_opera AS id_tipo, 
    o.isbn_issn,
    o.anno_pubblicazione,
    o.editore,
    o.lingua_originale,
    c.nome_tipo AS tipo,
    o.stato_opera,
    s.nome_serie AS serie,
    STRING_AGG(DISTINCT a.nome_autore, ', ') AS autori,
    STRING_AGG(DISTINCT g.nome_genere, ', ') AS generi,
    ARRAY_AGG(DISTINCT a.id_autore) FILTER (WHERE a.id_autore IS NOT NULL) AS autori_ids,
    ARRAY_AGG(DISTINCT g.id_genere) FILTER (WHERE g.id_genere IS NOT NULL) AS generi_ids
FROM opere o
LEFT JOIN tipo c ON o.tipo_opera = c.id_tipo
LEFT JOIN serie s ON o.id_serie = s.id_serie
LEFT JOIN autori_opere ao ON o.id_opera = ao.id_opera
LEFT JOIN autori a ON ao.id_autore = a.id_autore
LEFT JOIN generi_opere go ON o.id_opera = go.id_opera
LEFT JOIN generi g ON go.id_genere = g.id_genere
GROUP BY 
    o.id_opera, 
    o.id_serie,
    o.titolo, 
    o.tipo_opera,
    c.nome_tipo, 
    o.stato_opera, 
    s.nome_serie;
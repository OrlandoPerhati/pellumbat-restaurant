-- One-off migration: replace placeholder drinks with the real bar menu.
-- Idempotent: re-running clears the same placeholders and re-inserts the same rows.

DELETE FROM menu_items WHERE id IN ('bar-pije', 'whatsapp-oferte');

-- Kafeteri (positions 100-119)
INSERT OR REPLACE INTO menu_items (id, category, name, description, price, tags, available, position) VALUES
  ('caj-bustin',      'drinks', 'Çaj bustin',       '', '70 L',  'Kafeteri', 1, 100),
  ('caj-limon',       'drinks', 'Çaj Limon',        '', '70 L',  'Kafeteri', 1, 101),
  ('cokollate',       'drinks', 'Çokollatë',        '', '150 L', 'Kafeteri', 1, 102),
  ('decafionato',     'drinks', 'Decafionato',      '', '100 L', 'Kafeteri', 1, 103),
  ('kafe',            'drinks', 'Kafe',             '', '60 L',  'Kafeteri', 1, 104),
  ('kafe-kapucino',   'drinks', 'Kafe Kapuçino',    '', '100 L', 'Kafeteri', 1, 105),
  ('kafe-late',       'drinks', 'Kafe Late',        '', '160 L', 'Kafeteri', 1, 106),
  ('kafe-turke',      'drinks', 'Kafe Turke',       '', '60 L',  'Kafeteri', 1, 107),
  ('kakao',           'drinks', 'Kakao',            '', '150 L', 'Kafeteri', 1, 108),
  ('kakao-e-vogel',   'drinks', 'Kakao e vogël',    '', '60 L',  'Kafeteri', 1, 109),
  ('kapucino',        'drinks', 'Kapuçino',         '', '150 L', 'Kafeteri', 1, 110),
  ('koreto',          'drinks', 'Koreto',           '', '150 L', 'Kafeteri', 1, 111),
  ('makiato',         'drinks', 'Makiato',          '', '70 L',  'Kafeteri', 1, 112),
  ('qumesht',         'drinks', 'Qumësht',          '', '100 L', 'Kafeteri', 1, 113),
  ('salep',           'drinks', 'Salep',            '', '150 L', 'Kafeteri', 1, 114),
  ('salep-i-vogel',   'drinks', 'Salep i vogël',    '', '60 L',  'Kafeteri', 1, 115),
  ('uje-me-gaz-glin', 'drinks', 'Ujë me gaz Glin',  '', '60 L',  'Kafeteri', 1, 116),
  ('uje-vitamin',     'drinks', 'Ujë Vitamin',      '', '130 L', 'Kafeteri', 1, 117),
  ('uji-lajthiza',    'drinks', 'Uji Lajthiza',     '', '60 L',  'Kafeteri', 1, 118),
  ('uji-selita',      'drinks', 'Uji Selita',       '', '60 L',  'Kafeteri', 1, 119);

-- Freskuese (positions 120-139)
INSERT OR REPLACE INTO menu_items (id, category, name, description, price, tags, available, position) VALUES
  ('bitter',                    'drinks', 'Bitter',             '', '80 L',  'Freskuese', 1, 120),
  ('bravo',                     'drinks', 'Bravo',              '', '150 L', 'Freskuese', 1, 121),
  ('caj-i-ftohte',              'drinks', 'Çaj i ftohtë',       '', '150 L', 'Freskuese', 1, 122),
  ('coca-cola',                 'drinks', 'Coca-Cola',          '', '150 L', 'Freskuese', 1, 123),
  ('dhalle',                    'drinks', 'Dhallë',             '', '60 L',  'Freskuese', 1, 124),
  ('fanta',                     'drinks', 'Fanta',              '', '150 L', 'Freskuese', 1, 125),
  ('freskuese',                 'drinks', 'Freskuese',          '', '150 L', 'Freskuese', 1, 126),
  ('glina-tonik',               'drinks', 'Glina Tonik',        '', '150 L', 'Freskuese', 1, 127),
  ('glina-vitamin',             'drinks', 'Glina Vitamin',      '', '130 L', 'Freskuese', 1, 128),
  ('golden-eagle',              'drinks', 'Golden Eagle',       '', '150 L', 'Freskuese', 1, 129),
  ('heineken-pa-alkool-freskuese', 'drinks', 'Heineken pa alkool', '', '250 L', 'Freskuese', 1, 130),
  ('ivi-kanace',                'drinks', 'Ivi kanaçe',         '', '150 L', 'Freskuese', 1, 131),
  ('lemon-soda',                'drinks', 'Lemon Soda',         '', '150 L', 'Freskuese', 1, 132),
  ('leng-i-shtrydhur',          'drinks', 'Lëng i shtrydhur',   '', '180 L', 'Freskuese', 1, 133),
  ('nescafe-kanace',            'drinks', 'Nescafé kanaçe',     '', '200 L', 'Freskuese', 1, 134),
  ('orange-soda',               'drinks', 'Orange Soda',        '', '150 L', 'Freskuese', 1, 135),
  ('pepsi-033',                 'drinks', 'Pepsi 0.33',         '', '150 L', 'Freskuese', 1, 136),
  ('red-bull',                  'drinks', 'Red Bull',           '', '250 L', 'Freskuese', 1, 137),
  ('schweppes',                 'drinks', 'Schweppes',          '', '150 L', 'Freskuese', 1, 138);

-- Birrë (positions 140-159)
INSERT OR REPLACE INTO menu_items (id, category, name, description, price, tags, available, position) VALUES
  ('amstel',                   'drinks', 'Amstel',                   '', '150 L', 'Birrë', 1, 140),
  ('bavaria-pa-alkool-kanace', 'drinks', 'Bavaria pa alkool kanaçe', '', '150 L', 'Birrë', 1, 141),
  ('bavaria-pa-alkool-shishe', 'drinks', 'Bavaria pa alkool shishe', '', '150 L', 'Birrë', 1, 142),
  ('corona',                   'drinks', 'Corona',                   '', '250 L', 'Birrë', 1, 143),
  ('elbar',                    'drinks', 'Elbar',                    '', '130 L', 'Birrë', 1, 144),
  ('elbar-kanace',             'drinks', 'Elbar kanaçe',             '', '150 L', 'Birrë', 1, 145),
  ('heineken',                 'drinks', 'Heineken',                 '', '250 L', 'Birrë', 1, 146),
  ('heineken-pa-alkool-birre', 'drinks', 'Heineken pa alkool',       '', '250 L', 'Birrë', 1, 147),
  ('kaon',                     'drinks', 'Kaon',                     '', '120 L', 'Birrë', 1, 148),
  ('kriko-birre-madhe',        'drinks', 'Kriko Birrë e Madhe',      '', '130 L', 'Birrë', 1, 149),
  ('kriko-e-vogel',            'drinks', 'Kriko e vogël',            '', '70 L',  'Birrë', 1, 150),
  ('kuqalashe',                'drinks', 'Kuqalashe',                '', '130 L', 'Birrë', 1, 151),
  ('norga',                    'drinks', 'Norga',                    '', '120 L', 'Birrë', 1, 152),
  ('peja',                     'drinks', 'Peja',                     '', '120 L', 'Birrë', 1, 153),
  ('peja-kanace',              'drinks', 'Peja kanaçe',              '', '130 L', 'Birrë', 1, 154),
  ('peroni',                   'drinks', 'Peroni',                   '', '150 L', 'Birrë', 1, 155),
  ('peroni-kanace',            'drinks', 'Peroni kanaçe',            '', '150 L', 'Birrë', 1, 156),
  ('tuborg',                   'drinks', 'Tuborg',                   '', '150 L', 'Birrë', 1, 157);

-- Pije Vendi (positions 160-169)
INSERT OR REPLACE INTO menu_items (id, category, name, description, price, tags, available, position) VALUES
  ('fernet-skenderbeu', 'drinks', 'Fernet Skënderbeu', '', '90 L',  'Pije Vendi', 1, 160),
  ('fernet-vendi',      'drinks', 'Fernet Vendi',      '', '80 L',  'Pije Vendi', 1, 161),
  ('konjak-redon',      'drinks', 'Konjak Redon',      '', '80 L',  'Pije Vendi', 1, 162),
  ('konjak-skenderbeu', 'drinks', 'Konjak Skënderbeu', '', '90 L',  'Pije Vendi', 1, 163),
  ('konjak-martini',    'drinks', 'Konjak & Martini',  '', '200 L', 'Pije Vendi', 1, 164),
  ('ponc',              'drinks', 'Ponç',              '', '80 L',  'Pije Vendi', 1, 165),
  ('raki-kumbulle',     'drinks', 'Raki kumbulle',     '', '70 L',  'Pije Vendi', 1, 166),
  ('raki-manaferre',    'drinks', 'Raki manaferre',    '', '150 L', 'Pije Vendi', 1, 167),
  ('raki-rrushi',       'drinks', 'Raki rrushi',       '', '70 L',  'Pije Vendi', 1, 168),
  ('raki-thane',        'drinks', 'Raki thane',        '', '100 L', 'Pije Vendi', 1, 169);

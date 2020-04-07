INSERT INTO folder (id, name)
VALUES
('1', 'Woof'),
('2', 'Meow'),
('3', 'Roar'),
('4', 'Chirp')

INSERT INTO note (id, name, modified, folderId, content)
VALUES
('100', 'Dog', now() - '10 days'::INTERVAL, 1, 'Dogs go woof'),
('101', 'Cat', now() - '9 days'::INTERVAL, 2, 'Cats go meow'),
('102', 'Lion', now() = '8 days'::INTERVAL, 3, 'Lions go roar'),
('103', 'Bird', now() = '7 days'::INTERVAL, 4, 'Birds go chirp');
-- seed.sql: sample data (3 people, 4 expenses)
INSERT OR IGNORE INTO people (id, name) VALUES (1, 'Alice'), (2, 'Bob'), (3, 'Charlie');

INSERT INTO expenses (description, amount, payer_id, participants) VALUES
('Gas', 60.00, 1, '[1,2,3]'),
('Groceries', 45.00, 2, '[1,2,3]'),
('Campsite', 30.00, 3, '[1,3]'),
('Ice', 9.00, 1, '[2,3]');

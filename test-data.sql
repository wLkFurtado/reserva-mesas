-- Script para inserir dados de teste na tabela reservations
-- Execute este script no Supabase SQL Editor para adicionar reservas de exemplo

INSERT INTO reservations (customer_name, customer_email, customer_phone, guests, date, periodo, status, special_requests) VALUES
('João Silva', 'joao@email.com', '(11) 99999-1111', 4, '2025-01-15', 'tarde', 'confirmada', 'Mesa próxima à janela'),
('Maria Santos', 'maria@email.com', '(11) 99999-2222', 2, '2025-01-15', 'noite', 'confirmada', NULL),
('Pedro Oliveira', 'pedro@email.com', '(11) 99999-3333', 6, '2025-01-16', 'tarde', 'pendente', 'Aniversário - decoração especial'),
('Ana Costa', 'ana@email.com', '(11) 99999-4444', 3, '2025-01-16', 'noite', 'confirmada', NULL),
('Carlos Ferreira', 'carlos@email.com', '(11) 99999-5555', 5, '2025-01-17', 'tarde', 'confirmada', 'Cadeira de bebê necessária'),
('Lucia Mendes', 'lucia@email.com', '(11) 99999-6666', 2, '2025-01-17', 'noite', 'cancelada', NULL),
('Roberto Lima', 'roberto@email.com', '(11) 99999-7777', 4, '2025-01-18', 'tarde', 'confirmada', NULL),
('Fernanda Rocha', 'fernanda@email.com', '(11) 99999-8888', 8, '2025-01-18', 'noite', 'pendente', 'Grupo grande - mesa redonda preferível');
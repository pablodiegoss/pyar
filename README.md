# PyAR

## Acesso via rede local (mobile testing com HTTPS)

Para testar no celular com acesso à câmera, é necessário servir via HTTPS e expor o servidor do WSL na rede local.

### 1. Descobrir o IP do WSL

No terminal WSL:

```bash
hostname -I
```

Anote o primeiro IP (ex: `172.20.91.42`).

### 2. Configurar firewall e port proxy (PowerShell como Admin)

```powershell
# Abrir porta 8000 no firewall do Windows
netsh advfirewall firewall add rule name="WSL Django 8000" dir=in action=allow protocol=TCP localport=8000

# Redirecionar tráfego da rede local para o WSL (substituir <IP_WSL> pelo IP do passo 1)
netsh interface portproxy add v4tov4 listenaddress=0.0.0.0 listenport=8000 connectaddress=<IP_WSL> connectport=8000
```

Para verificar:

```powershell
netsh interface portproxy show all
```

### 3. Rodar o servidor com HTTPS

```bash
python manage.py runserver_plus --cert-file /tmp/cert.pem --key-file /tmp/key.pem 0.0.0.0:8000
```

No celular, acessar `https://<IP_DO_PC>:8000` (ex: `https://192.168.1.162:8000`) e aceitar o aviso de certificado.

### 4. Remover regras depois

```powershell
netsh interface portproxy delete v4tov4 listenaddress=0.0.0.0 listenport=8000
netsh advfirewall firewall delete rule name="WSL Django 8000"
```

### Notas

- O IP do WSL pode mudar ao reiniciar. Rode `hostname -I` novamente se parar de funcionar.
- `ALLOWED_HOSTS` em `configs/settings.py` deve incluir o IP do PC na rede local.
- O `django_extensions` deve estar em `INSTALLED_APPS`.

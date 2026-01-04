<!DOCTYPE html>
<html>
<head>
    <title>Convite American Trip</title>
</head>
<body>
    <h1>Olá!</h1>
    <p>Você foi convidado para participar da casa <strong>{{ $invite->home->name }}</strong> no sistema American Trip.</p>
    
    <p>Acesse o sistema para aceitar ou recusar o convite:</p>
    <a href="{{ url('/selecione-a-casa') }}">Acessar Sistema</a>
    
    <p>Obrigado!</p>
</body>
</html>

# Usamos una imagen oficial de Python ligera
FROM python:3.11-slim

# Le decimos a Docker que trabaje dentro de la carpeta /app
WORKDIR /app

# Copiamos el archivo de requerimientos y los instalamos
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiamos el resto de tu código
COPY . .

# El comando para encender el servidor cuando arranque el contenedor
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
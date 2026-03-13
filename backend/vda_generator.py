import models

def generar_vda_4913(embarque: models.EmbarqueCabecera) -> str:
    lineas_vda = []
    
    # --- REGISTRO 711: CABECERA DEL EMBARQUE ---
    # Posiciones:
    # 1-3: Tipo de registro ("711")
    # 4-5: Versión ("02")
    # 6-14: Número de cliente (9 caracteres, relleno con ceros)
    # 15-23: Tu número de proveedor asignado (Ej. "ASSA00001")
    # 24-31: Folio del embarque (8 caracteres, relleno con espacios)
    # ... y luego rellenamos todo lo demás con espacios hasta llegar a 128
    
    tipo_711 = "711"
    version = "02"
    cliente_str = str(embarque.cliente_id).zfill(9) # Si el ID es 1, será "000000001"
    proveedor = "ASSA00001"
    folio = embarque.folio_embarque.ljust(8)[:8] # [:8] asegura que si el folio es muy largo, se corte a 8
    
    # Armamos la línea y le decimos que la rellene de espacios hasta 128
    linea_cabecera = f"{tipo_711}{version}{cliente_str}{proveedor}{folio}".ljust(128)
    lineas_vda.append(linea_cabecera)
    
    # --- REGISTRO 712: DETALLE (SE REPITE POR CADA PIEZA) ---
    for detalle in embarque.detalles:
        # 1-3: Tipo ("712")
        # 4-5: Versión ("02")
        # 6-27: Número de parte (22 caracteres, relleno con espacios)
        # 28-40: Cantidad (13 caracteres, relleno con ceros)
        
        tipo_712 = "712"
        parte_str = detalle.numero_parte.ljust(22)[:22]
        cantidad_str = str(detalle.cantidad).zfill(13) # Si cantidad es 50, será "0000000000050"
        
        linea_detalle = f"{tipo_712}{version}{parte_str}{cantidad_str}".ljust(128)
        lineas_vda.append(linea_detalle)
        
    # Unimos todas las líneas con un salto de línea tradicional de Windows/DOS (\r\n)
    return "\r\n".join(lineas_vda)
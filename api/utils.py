from api.models import Semestre, Ramo, Profesor, Curso, Evaluacion, Semana

import datetime

EVALS = 3
CURSOS = 2
FULL = 1


def create_semester(semester, level=EVALS):
    semester, errores = semester
    response = {'warning': []}
    response['prof status'] = []
    response['curso status'] = []
    response['ramos status'] = []
    response['status_error'] = 0
    response['status_warning'] = 0
    try:
        if level == EVALS:
            response['eval status'] = []
        sem = Semestre.objects.filter(
            año=semester['year'], periodo=semester['period'])
        if sem:
            if level == FULL:  # si se quiere crear un semestre totalmente nuevo, pero ya está.
                response['status'] = 'Semestre ya existe en base de datos. ¿Desea \
completar un semestre ya existente?'
                response['status_warning'] = 1
                return response
            else:
                sem = sem.get()
        else:
            sem = Semestre.objects.create(
                año=semester['year'], inicio=semester['start'],
                fin=semester['finish'],
                periodo=semester['period'], estado=3)
        # ingresar cada curso al semestre
        for curso in semester["cursos"]:
            ramo = Ramo.objects.filter(codigo=curso['codigo'])
            if not ramo:
                ramo = Ramo.objects.create(
                    nombre=curso['nombre'], codigo=curso['codigo'],
                    semestre_malla=curso['semestre_malla'])
                response['ramos status'].append(
                    f'{ramo} agregado a la base de datos de ramos.')
            else:
                ramo = ramo.get()
                response['ramos status'].append(f'{ramo.codigo} ya existe en la base de datos \
con el nombre {ramo}')
            print(ramo)
            curso_inst = Curso.objects.filter(
                ramo=ramo, semestre=sem, seccion=curso['seccion'])
            if curso_inst:
                if level == CURSOS:
                    response['warning'].append(
                        f'curso {str(curso_inst.get())} ya existente, información \
no agregada.')
                    continue
                else:
                    curso_inst = curso_inst.get()
            else:
                curso_inst = Curso.objects.create(
                    ramo=ramo, semestre=sem, seccion=curso['seccion'])
                response['curso status'].append(
                    f'{curso_inst}, agregado correctamente.')
            for profe in curso['profesor']:
                prof, prof_created = Profesor.objects.get_or_create(
                    nombre=profe['nombre'])
                if prof_created:
                    response['prof status'].append(f'{prof} no encontrado en base \
de datos, se ha agregado una nueva entrada para {prof}')
                curso_inst.profesor.add(prof)
            for eval in curso['evaluaciones']:
                eval_inst = Evaluacion.objects.filter(
                    titulo=eval['titulo'],
                    curso=curso_inst)
                if eval_inst:
                    if level == EVALS:
                        response['warning'].append(
                            f'{eval} ya existente, no agregada')
                else:
                    eval_inst = Evaluacion.objects.create(
                        fecha=eval['fecha'], tipo=eval['tipo'], titulo=eval['titulo'],
                        curso=curso_inst)
                    if level == EVALS:
                        response['eval status'].append(
                            f'{eval_inst} agregada correctamente')
        response['status'] = "Todo correcto!"
    except Exception as e:
        print(e)
        response['status'] = 'Error no identificado, se ha detenido\
 la carga del semestre en un punto indeterminado'
        if level == FULL:
            sem.delete()
        response['status_error'] = 1
        return response
    response['errores'] = errores
    return response


def create_full_semester(semester):
    return create_semester(semester, level=FULL)


def add_courses_to_semester(semester):
    return create_semester(semester, level=CURSOS)


def add_evals_to_semester(semester):
    return create_semester(semester, level=EVALS)


def clonar_semestre(s_data):
    errores = []
    año = s_data['año']
    estado = s_data['estado']
    inicio = s_data['inicio']
    fin = s_data['fin']
    periodo = s_data['periodo']
    from_año = s_data['from_año']
    from_periodo = s_data['from_periodo']
    lista_periodo = ['Otoño', 'Primavera']

    one_day = datetime.timedelta(days=1)
    try:
        if Semestre.objects.filter(año=año, periodo=periodo):
            raise Exception(
                f'El semestre {lista_periodo[periodo]} {año} ya existe.')
        new_sem = Semestre.objects.create(año=año, inicio=inicio,
                                          fin=fin, periodo=periodo, estado=estado)
    except Exception as e:
        errores.append(str(e))
        return None, errores
    old_sem = Semestre.objects.filter(año=from_año, periodo=from_periodo).get()
    semanas_new_sem = new_sem.cantidad_semanas()
    semanas_old_sem = old_sem.cantidad_semanas()
    if semanas_new_sem != semanas_old_sem:
        errores.append(
            f'La cantidad de semanas difiere entre {old_sem} ({semanas_old_sem} semanas) y {new_sem} ({semanas_new_sem} semanas), se detiene la carga')
        new_sem.delete()
        return None, errores
    old_cursos = Curso.objects.filter(semestre=old_sem)
    try:
        for curso in old_cursos:
            profes = []
            evaluaciones = Evaluacion.objects.filter(curso=curso)
            for prof in curso.profesor.all():
                profes.append(prof)
            new_curso = curso
            new_curso.pk = None
            new_curso.semestre = new_sem
            new_curso.save()
            for prof in profes:
                new_curso.profesor.add(prof)
            for evalu in evaluaciones:
                current = evalu.fecha
                dia_semana = current.weekday()
                semana = Semana.objects.filter(inicio__lte=current)
                semana = semana.filter(fin__gte=current)
                semana = semana.filter(semestre=evalu.curso.semestre)
                if semana:
                    semana = semana.get()
                else:
                    continue
                nro_semana = semana.numero
                new_semana = Semana.objects.filter(
                    numero=nro_semana, semestre=new_sem).get()
                new_eval_day = new_semana.inicio
                while dia_semana:
                    new_eval_day += one_day
                    dia_semana -= 1
                Evaluacion.objects.create(
                    fecha=new_eval_day, tipo=evalu.tipo, titulo=evalu.titulo, curso=new_curso)
    except Exception as ex:
        errores.append(str(ex))
        new_sem.delete()
        return None, errores
    return new_sem, errores

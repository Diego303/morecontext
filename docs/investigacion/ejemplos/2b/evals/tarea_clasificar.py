from inspect_ai import Task, task
from inspect_ai.dataset import Sample
from inspect_ai.scorer import includes
from inspect_ai.solver import generate, system_message

@task
def clasificar_tickets():
    return Task(
        dataset=[
            Sample(input="Me cobrasteis dos veces este mes", target="facturacion"),
            Sample(input="El paquete no ha llegado", target="envio"),
        ],
        solver=[system_message("Clasifica el ticket: facturacion, envio, devolucion u otro. Responde solo la categoría."), generate()],
        scorer=includes(),
    )

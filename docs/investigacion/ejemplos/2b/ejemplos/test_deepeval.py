# DeepEval con juez local: antes, `deepeval set-ollama --model qwen3.6:27b` (base URL por defecto http://localhost:11434)
from deepeval import assert_test
from deepeval.metrics import GEval
from deepeval.test_case import LLMTestCase, SingleTurnParams

def test_respuesta_devoluciones():
    correccion = GEval(
        name="Corrección",
        criteria="¿La respuesta real dice lo mismo que la esperada?",
        evaluation_params=[SingleTurnParams.ACTUAL_OUTPUT, SingleTurnParams.EXPECTED_OUTPUT],
        threshold=0.7,
    )
    caso = LLMTestCase(
        input="¿Cuánto tiempo tengo para devolver un producto?",
        actual_output="Tienes 30 días desde la entrega.",   # sustituye por la salida de tu agente
        expected_output="30 días naturales desde la entrega.",
    )
    assert_test(caso, [correccion])
# Ejecuta: deepeval test run test_deepeval.py

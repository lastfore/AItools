"""Tests for TTS/STT model connection testing helpers."""

from open_notebook.ai.connection_tester import _resolve_test_tts_params


def test_resolve_test_tts_params_moss():
    voice, text = _resolve_test_tts_params("fnlp/MOSS-TTSD-v0.5", "openai_compatible")
    assert voice == "fnlp/MOSS-TTSD-v0.5:anna"
    assert text.startswith("[S1]")


def test_resolve_test_tts_params_cosyvoice():
    voice, text = _resolve_test_tts_params("FunAudioLLM/CosyVoice2-0.5B", "openai_compatible")
    assert voice == "FunAudioLLM/CosyVoice2-0.5B:anna"
    assert "Open Notebook" in text


def test_resolve_test_tts_params_kokoro_onnx():
    voice, text = _resolve_test_tts_params("speaches-ai/Kokoro-82M-v1.0-ONNX", "openai_compatible")
    assert voice == "af_bella"
    assert "Open Notebook" in text


def test_resolve_test_tts_params_kokoro_zh():
    voice, text = _resolve_test_tts_params("hexgrad/Kokoro-82M-v1.1-zh", "openai_compatible")
    assert voice == "zf_xiaoxiao"
    assert "Open Notebook" in text

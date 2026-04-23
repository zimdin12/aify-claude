import tempfile
import unittest

from fastapi.testclient import TestClient
from starlette.websockets import WebSocketDisconnect

import service.main as main_module
from service.config import ServiceConfig


class WebsocketAuthTests(unittest.TestCase):
    def setUp(self):
        self._tmpdir = tempfile.TemporaryDirectory()
        self._original_get_config = main_module.get_config
        config = ServiceConfig(
            data_dir=self._tmpdir.name,
            config_dir=self._tmpdir.name,
            api_key="secret",
            mcp_enabled=False,
            cors_origins=["*"],
        )
        main_module.get_config = lambda: config
        self.app = main_module.create_app()

    def tearDown(self):
        main_module.get_config = self._original_get_config
        self._tmpdir.cleanup()

    def test_websocket_requires_api_key(self):
        with TestClient(self.app) as client:
            with self.assertRaises(WebSocketDisconnect):
                with client.websocket_connect("/ws?agent_id=tester"):
                    pass

    def test_websocket_accepts_valid_api_key_and_tracks_agent(self):
        with TestClient(self.app) as client:
            with client.websocket_connect("/ws?agent_id=tester&api_key=secret") as ws:
                ws.send_text("ping")
                self.assertIn("tester", client.app.state.ws_manager.online_agents())

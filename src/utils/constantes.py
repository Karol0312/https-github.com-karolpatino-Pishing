
class Constants:

    def __init__(self):

        self._SUCCESS = 0
        self._ERROR = -1

        self._DATABASE_NAME = "PisshingDB"
        self._CONTAINER_NAME = "emails"

        self._PROMT = """"""

        self._PROMT_SYSTEM = """"""

        self._PROMT_TEMPERATURE = 0.1

    @property
    def SUCCESS(self):
        return self._SUCCESS

    @property
    def ERROR(self):
        return self._ERROR

    @property
    def DATABASE_NAME(self):
        return self._DATABASE_NAME

    @property
    def CONTAINER_NAME(self):
        return self._CONTAINER_NAME

    @property
    def PROMT(self):
        # return self._PROMT
        # todo prueba dinamica
        with open('PROMT.TXT', 'r') as f:
            return f.read()

    @property
    def PROMT_SYSTEM(self):
        # return self._PROMT_SYSTEM
        # todo prueba dinamica
        with open('PROMT_SYSTEM.TXT', 'r') as f:
            return f.read()

    @property
    def PROMT_TEMPERATURE(self):
        # return self._PROMT_SYSTEM
        # todo prueba dinamica
        with open('PROMT_TEMPERATURE.TXT', 'r') as f:
            return f.read()

cte = Constants()
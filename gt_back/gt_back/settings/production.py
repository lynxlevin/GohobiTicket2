import environ

from .base import *

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False

env = environ.Env()
env.read_env(".env")

ALLOWED_HOSTS = env.list("ALLOWED_HOSTS")


# Logging
#  https://docs.djangoproject.com/en/2.0/topics/logging/
LOGGING = {
    "version": 1,
    "desable_existing_loggers": False,
    "formatters": {
        "default": {
            "()": "gt_back.logging.Formatter",
            "format": "[%(asctime)s] [%(levelname)s] [%(name)s:%(lineno)s] %(message)s",
            "datefmt": "%Y-%m-%d %H:%M:%S",
        },
    },
    "handlers": {
        "console": {
            "level": "INFO",
            "class": "logging.StreamHandler",
            "formatter": "default",
        },
        "file": {
            "level": "INFO",
            "class": "logging.handlers.RotatingFileHandler",
            "filename": "django.log",
            "maxBytes": 50 * 1000 * 1000,
            "backupCount": 1,
            "formatter": "default",
        },
    },
    "loggers": {
        "django": {
            "handlers": ["file"],
            "level": "INFO",
        },
        "django.db.backends": {
            "handlers": ["file"],
            "level": "INFO",
            "propagate": False,
        },
        "django.utils": {
            "handlers": ["file"],
            "level": "INFO",
            "propagate": False,
        },
        "gt_back": {
            "handlers": ["file"],
            "level": "INFO",
        },
        "tickets": {
            "handlers": ["file"],
            "level": "INFO",
        },
        "user_relations": {
            "handlers": ["file"],
            "level": "INFO",
        },
        "users": {
            "handlers": ["file"],
            "level": "INFO",
        },
        "diaries": {
            "handlers": ["file"],
            "level": "INFO",
        },
    },
}

"""
Script pour nettoyer la base de données de test
Usage: python clean_test_db.py
"""

import psycopg
import os
from dotenv import load_dotenv

load_dotenv()

def clean_test_database():
    """Supprime toutes les bases de test"""
    try:
        # Connexion à la base postgres par défaut
        conn = psycopg.connect(
            dbname='postgres',
            user=os.getenv('DB_USER', 'postgres'),
            password=os.getenv('DB_PASSWORD', ''),
            host=os.getenv('DB_HOST', 'localhost'),
            port=os.getenv('DB_PORT', '5432'),
            autocommit=True
        )
        
        cursor = conn.cursor()
        
        # Liste des bases de test possibles
        test_dbs = ['test_DzCarPool', 'test_dzcarpool', 'DzCarPool_test']
        
        for db_name in test_dbs:
            try:
                # Déconnecter tous les utilisateurs
                cursor.execute(f"""
                    SELECT pg_terminate_backend(pg_stat_activity.pid)
                    FROM pg_stat_activity
                    WHERE pg_stat_activity.datname = '{db_name}'
                    AND pid <> pg_backend_pid();
                """)
                
                # Supprimer la base
                cursor.execute(f"DROP DATABASE IF EXISTS {db_name};")
                print(f"✅ Base '{db_name}' supprimée")
            except Exception as e:
                print(f"⚠️  Erreur pour '{db_name}': {e}")
        
        cursor.close()
        conn.close()
        print("\n✅ Nettoyage terminé!")
        
    except Exception as e:
        print(f"❌ Erreur: {e}")

if __name__ == "__main__":
    clean_test_database()
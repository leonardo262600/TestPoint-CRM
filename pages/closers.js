import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../components/Layout';
import { getSession, logout } from '../lib/auth';

const ClosersPage = () => {
  const [session, setSession] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const current = getSession();
    if (!current) {
      router.replace('/login');
      return;
    }
    setSession(current);
  }, [router]);

  if (!session) return null;

  return (
    <Layout title="Closers" session={session} onLogout={() => logout(router)}>
      <div className="dashboard-grid closers-grid">
        <Link className="card card-dashboard closer-card-link" href="/llamadas?closer=nazaret">
          <h3>Nazaret</h3>
          <ul className="closer-metrics">
            <li>Numero de Ventas: <strong>18</strong></li>
            <li>Cash Colleted: <strong>24.300 €</strong></li>
            <li>Comisión: <strong>3.150 €</strong></li>
          </ul>
        </Link>

        <Link className="card card-dashboard closer-card-link" href="/llamadas?closer=alvaro">
          <h3>Álvaro</h3>
          <ul className="closer-metrics">
            <li>Numero de Ventas: <strong>14</strong></li>
            <li>Cash Colleted: <strong>19.100 €</strong></li>
            <li>Comisión: <strong>2.480 €</strong></li>
          </ul>
        </Link>

        <Link className="card card-dashboard closer-card-link" href="/llamadas?closer=lucia">
          <h3>Lucía</h3>
          <ul className="closer-metrics">
            <li>Numero de Ventas: <strong>16</strong></li>
            <li>Cash Colleted: <strong>21.850 €</strong></li>
            <li>Comisión: <strong>2.970 €</strong></li>
          </ul>
        </Link>

        <Link className="card card-dashboard closer-card-link" href="/llamadas?closer=marcos">
          <h3>Marcos</h3>
          <ul className="closer-metrics">
            <li>Numero de Ventas: <strong>11</strong></li>
            <li>Cash Colleted: <strong>15.400 €</strong></li>
            <li>Comisión: <strong>2.030 €</strong></li>
          </ul>
        </Link>

        <Link className="card card-dashboard closer-card-link" href="/llamadas?closer=paula">
          <h3>Paula</h3>
          <ul className="closer-metrics">
            <li>Numero de Ventas: <strong>13</strong></li>
            <li>Cash Colleted: <strong>17.600 €</strong></li>
            <li>Comisión: <strong>2.290 €</strong></li>
          </ul>
        </Link>

        <Link className="card card-dashboard closer-card-link" href="/llamadas?closer=diego">
          <h3>Diego</h3>
          <ul className="closer-metrics">
            <li>Numero de Ventas: <strong>9</strong></li>
            <li>Cash Colleted: <strong>12.950 €</strong></li>
            <li>Comisión: <strong>1.680 €</strong></li>
          </ul>
        </Link>

        <Link className="card card-dashboard closer-card-link" href="/llamadas?closer=carla">
          <h3>Carla</h3>
          <ul className="closer-metrics">
            <li>Numero de Ventas: <strong>15</strong></li>
            <li>Cash Colleted: <strong>20.200 €</strong></li>
            <li>Comisión: <strong>2.760 €</strong></li>
          </ul>
        </Link>

        <Link className="card card-dashboard closer-card-link" href="/llamadas?closer=ivan">
          <h3>Iván</h3>
          <ul className="closer-metrics">
            <li>Numero de Ventas: <strong>10</strong></li>
            <li>Cash Colleted: <strong>13.500 €</strong></li>
            <li>Comisión: <strong>1.790 €</strong></li>
          </ul>
        </Link>

        <Link className="card card-dashboard closer-card-link" href="/llamadas?closer=sofia">
          <h3>Sofía</h3>
          <ul className="closer-metrics">
            <li>Numero de Ventas: <strong>12</strong></li>
            <li>Cash Colleted: <strong>16.800 €</strong></li>
            <li>Comisión: <strong>2.210 €</strong></li>
          </ul>
        </Link>
      </div>
    </Layout>
  );
};

export default ClosersPage;

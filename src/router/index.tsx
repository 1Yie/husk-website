import { createBrowserRouter } from 'react-router-dom';

import { Docs, DocsIndex } from '@/pages/docs';
import { Home } from '@/pages/home';
import { NotFound } from '@/pages/not-found';

export const router = createBrowserRouter([
	{
		path: '/',
		element: <Home />,
	},
	{
		path: '/docs',
		element: <DocsIndex />,
	},
	{
		path: '/docs/*',
		element: <Docs />,
	},
	{
		path: '*',
		element: <NotFound />,
	},
]);
